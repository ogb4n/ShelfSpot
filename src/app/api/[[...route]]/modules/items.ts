import { NextResponse } from "next/server";
import { ApiModule } from "../types";
import { prisma } from "@/app/utils/prisma";
import { Item } from "@/app/types";

export const itemsModule: ApiModule = {
  routes: [
    {
      path: "items",
      handlers: {
        GET: async (req) => {
          const { searchParams } = new URL(req.url);
          const id = searchParams.get("id");
          const search = searchParams.get("search")?.trim() || "";
          if (id) {
            try {
              const item = await prisma.item.findUnique({
                where: { id: Number(id) },
                include: {
                  room: true,
                  place: true,
                  container: true,
                  itemTags: { include: { tag: true } },
                },
              });
              if (!item) {
                return NextResponse.json({ error: "Item not found" }, { status: 404 });
              }
              return NextResponse.json({
                ...item,
                tags: item.itemTags ? item.itemTags.map((itemTag) => itemTag.tag.name) : [],
                itemTags: undefined,
              });
            } catch {
              // error is intentionally ignored, handled by the return statement below
              return NextResponse.json({ error: "Failed to fetch item." }, { status: 500 });
            }
          }
          try {
            const items = await prisma.item.findMany({
              include: {
                room: true,
                place: true,
                container: true,
                itemTags: {
                  include: {
                    tag: true,
                  },
                },
              },
            });

            // Filtrage avancé côté serveur si search est présent
            let filteredItems = items;
            if (search) {
              const normalize = (str: unknown) => (str as string).normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
              const searchWords = (normalize(search) as string).split(/\s+/).filter(Boolean);
              filteredItems = items.filter((item) => {
                const fields = [
                  item.name,
                  item.status,
                  item.room?.name,
                  item.place?.name,
                  item.container?.name,
                  ...(item.itemTags?.map((t) => t.tag.name) || [])
                ].filter(Boolean).map(normalize);
                return searchWords.every(word =>
                  fields.some(field => (field as string).includes(word))
                );
              });
            }

            const transformedItems = filteredItems.map((item) => ({
              ...item,
              tags: item.itemTags.map((itemTag) => itemTag.tag.name),
              itemTags: undefined,
            }));
            return NextResponse.json(transformedItems);
          } catch (error) {
            console.error("Error fetching items:", error);

            return NextResponse.json(
              {
                error: "Failed to fetch items.",
                details:
                  error instanceof Error ? error.message : "Unknown error",
              },
              { status: 500 }
            );
          }
        },
      },
    },
    {
      path: "items/add",
      handlers: {
        POST: async (req) => {
          try {
            const { name, quantity, status, roomId, placeId, tags }: Item =
              await req.json();

            if (!name || !roomId) {
              return NextResponse.json(
                { error: "The fields 'name' and 'roomId' are required." },
                { status: 400 }
              );
            }

            if (placeId) {
              const placeExists = await prisma.place.findUnique({
                where: { id: placeId },
              });
              if (!placeExists) {
                return NextResponse.json(
                  { error: `Place with ID ${placeId} does not exist.` },
                  { status: 404 }
                );
              }
            }

            const item = await prisma.item.create({
              data: {
                name: name,
                quantity: quantity,
                status: status,
                itemTags: {
                  create: tags?.map((tag) => ({
                    tag: {
                      connectOrCreate: {
                        where: { name: tag },
                        create: { name: tag },
                      },
                    },
                  })),
                },
                roomId: roomId,
                placeId: placeId,
              },
              include: {
                room: true,
                place: true,
                container: true,
              },
            });

            return NextResponse.json(item);
          } catch (error) {
            console.error("Error creating item:", error);
            return NextResponse.json(
              { error: "Failed to create item. Please try again later." },
              { status: 500 }
            );
          }
        },
      },
    },
    {
      path: "items/delete",
      handlers: {
        DELETE: async (req) => {
          const { searchParams } = new URL(req.url);
          const id = parseInt(searchParams.get("id") as string, 10);

          const item = await prisma.item.delete({
            where: {
              id,
            },
          });

          return NextResponse.json(item);
        },
      },
    },
    {
      path: "items/edit",
      handlers: {
        POST: async (req) => {
          const body = await req.json();
          if (!body || typeof body !== "object") {
            return NextResponse.json(
              { error: "Invalid request body" },
              { status: 400 }
            );
          }

          try {
            // Correction : utiliser l'id si disponible, sinon le nom (string)
            let place;
            if (typeof body.placeId === "number") {
              place = await prisma.place.findUniqueOrThrow({
                where: { id: body.placeId },
              });
            } else if (typeof body.place === "string") {
              place = await prisma.place.findFirstOrThrow({
                where: { name: body.place },
              });
            } else {
              return NextResponse.json(
                { error: "A valid placeId or place name must be provided." },
                { status: 400 }
              );
            }
            let room;
            if (typeof body.roomId === "number") {
              room = await prisma.room.findUniqueOrThrow({
                where: { id: body.roomId },
              });
            } else if (typeof body.room === "string") {
              room = await prisma.room.findFirstOrThrow({
                where: { name: body.room },
              });
            } else {
              return NextResponse.json(
                { error: "A valid roomId or room name must be provided." },
                { status: 400 }
              );
            }
            
            // Prepare update data
            const updateData: Record<string, unknown> = {
              name: body.name ?? "",
              quantity: Number(body.quantity) || 0,
              place: {
                connect: { id: place.id },
              },
              room: {
                connect: { id: room.id },
              },
              status: body.status ?? "",
            };
            
            // Only include container connection if containerId is defined
            if (body.containerId && body.containerId !== undefined) {
              updateData.container = {
                connect: { id: body.containerId }
              };
            } else {
              // If no container is selected, disconnect any existing container
              updateData.container = {
                disconnect: true
              };
            }
            
            const item = await prisma.item.update({
              where: { id: body.id },
              data: updateData,
            });

            return NextResponse.json(item);
          } catch (error) {
            console.error("Error updating item:", error);
            return NextResponse.json(
              { error: "An error occurred while updating the item." },
              { status: 500 }
            );
          }
        },
      },
    },
    {
      path: "items/consumables",
      handlers: {
        GET: async () => {
          try {
            const consumables = await prisma.item.findMany({
              where: {
                consumable: true,
              },
              include: {
                room: true,
                place: true,
                container: true,
                itemTags: {
                  include: {
                    tag: true,
                  },
                },
              },
            });

            const transformedConsumables = consumables.map((item) => ({
              ...item,
              tags: item.itemTags ? item.itemTags.map((itemTag) => itemTag.tag.name) : [],
              itemTags: undefined,
            }));

            return NextResponse.json(transformedConsumables);
          } catch (error) {
            console.error("Error fetching consumables:", error);
            return NextResponse.json(
              { error: "Failed to fetch consumables." },
              { status: 500 }
            );
          }
        },
      },
    },
    {
      path: "favourites",
      handlers: {
        GET: async () => {
          try {
            const favourites = await prisma.favourite.findMany({
              include: {
                item: {
                  include: {
                    room: true,
                    place: true,
                  },
                },
              },
            });

            return NextResponse.json(favourites);
          } catch (error) {
            console.error("Error fetching favourites:", error);
            return NextResponse.json(
              { error: "Failed to fetch favourites." },
              { status: 500 }
            );
          }
        },
        POST: async (req) => {
          const { itemId, userName } = await req.json();

          if (!itemId) {
            return NextResponse.json(
              { error: "The field 'itemId' is required." },
              { status: 400 }
            );
          }

          const user = await prisma.user.findFirst({
            where: {
              name: userName,
            },
          });

          if (!user) {
            return NextResponse.json(
              { error: "User not found." },
              { status: 404 }
            );
          }

          const favourite = await prisma.favourite.create({
            data: {
              itemId: itemId,
              userId: user.id,
            },
          });

          return NextResponse.json(favourite);
        },
        DELETE: async (req) => {
          const { searchParams } = new URL(req.url);
          const itemId = parseInt(searchParams.get("id") as string, 10);

          // First find the favorite entry by itemId
          const favorite = await prisma.favourite.findFirst({
            where: {
              itemId: itemId,
            },
          });

          if (!favorite) {
            return NextResponse.json(
              { error: "Favorite not found" },
              { status: 404 }
            );
          }

          // Then delete using the favorite's actual ID
          const deletedFavorite = await prisma.favourite.delete({
            where: {
              id: favorite.id,
            },
          });

          return NextResponse.json(deletedFavorite);
        },
      },
    },
  ],
};

import { NextResponse } from "next/server";
import { ApiModule } from "../types";
import { prisma } from "@/app/utils/prisma";
import { Item } from "@/app/types";

export const itemsModule: ApiModule = {
  routes: [
    {
      path: "items",
      handlers: {
        GET: async () => {
          try {
            const items = await prisma.item.findMany({
              include: {
                room: true,
                place: true,
                itemTags: {
                  include: {
                    tag: true,
                  },
                },
              },
            });

            const transformedItems = items.map((item) => ({
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
            const place = await prisma.place.findFirstOrThrow({
              where: { name: body.place },
            });
            const room = await prisma.room.findFirstOrThrow({
              where: { name: body.room },
            });
            const item = await prisma.item.update({
              where: { id: body.id },
              data: {
                name: body.name ?? "",
                quantity: Number(body.quantity) || 0,
                place: {
                  connect: { id: place.id },
                },
                room: {
                  connect: { id: room.id },
                },
                status: body.status ?? "",
              },
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
                place: true, // Add place relationship
              },
            });

            return NextResponse.json(consumables);
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

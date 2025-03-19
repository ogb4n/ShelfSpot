import { NextResponse } from "next/server";
import { ApiModule } from "../types";
import { prisma } from "@/app/utils/prisma";
import { Item } from "@/app/utils/types";

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
                place: true, // Add this line to include place data
              },
            });
            return NextResponse.json(items);
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

            const tagsToString = tags?.join(",");

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
                roomId: roomId,
                tags: tagsToString,
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
            const item = await prisma.item.update({
              where: { id: body.id },
              data: {
                name: body.name ?? "",
                quantity: Number(body.quantity) || 0,
                placeId: body.placeId,
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
  ],
};

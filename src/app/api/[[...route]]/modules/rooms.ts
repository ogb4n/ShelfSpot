import { NextResponse } from "next/server";
import { ApiModule } from "../types";
import { prisma } from "@/app/utils/prisma";

export const roomsModule: ApiModule = {
  routes: [
    {
      path: "room",
      handlers: {
        GET: async () => {
          try {
            const rooms = await prisma.room.findMany({
              include: {
                places: true,
                _count: {
                  select: { items: true },
                },
              },
            });
            return NextResponse.json(rooms);
          } catch (error) {
            console.error("Error fetching rooms:", error);

            return NextResponse.json(
              {
                error: "Failed to fetch rooms.",
                details:
                  error instanceof Error ? error.message : "Unknown error",
              },
              { status: 500 }
            );
          }
        },
        POST: async (req) => {
          try {
            const body = await req.json();

            const room = await prisma.room.create({
              data: {
                name: body.name,
                icon: body.icon,
              },
            });

            return NextResponse.json(room);
          } catch (error) {
            console.error("Error creating room:", error);

            return NextResponse.json(
              {
                error: "Failed to create room.",
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
      path: "room/:id",
      handlers: {
        DELETE: async (req, params) => {
          try {
            const id = parseInt(params.id);
            if (!id) {
              return NextResponse.json(
                { error: "Invalid room ID" },
                { status: 400 }
              );
            }

            const room = await prisma.room.delete({
              where: {
                id: id,
              },
            });

            return NextResponse.json(room);
          } catch (error) {
            console.error("Error deleting room:", error);

            return NextResponse.json(
              {
                error: "Failed to delete room.",
                details:
                  error instanceof Error ? error.message : "Unknown error",
              },
              { status: 500 }
            );
          }
        },
        PUT: async (req, params) => {
          try {
            const id = parseInt(params.id);
            if (!id) {
              return NextResponse.json(
                { error: "Invalid room ID" },
                { status: 400 }
              );
            }

            const body = await req.json();
            console.log("Parsed body:", body);

            const room = await prisma.room.update({
              where: {
                id: id,
              },
              data: {
                name: body.name,
                icon: body.icon,
              },
            });

            return NextResponse.json(room);
          } catch (error) {
            console.error("Error updating room:", error);

            return NextResponse.json(
              {
                error: "Failed to update room.",
                details:
                  error instanceof Error ? error.message : "Unknown error",
              },
              { status: 500 }
            );
          }
        },
      },
    },
  ],
};

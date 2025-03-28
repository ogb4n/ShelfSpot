import { NextResponse } from "next/server";
import { ApiModule } from "../types";
import { prisma } from "@/app/utils/prisma";

export const ContainersModule: ApiModule = {
  routes: [
    {
      path: "containers",
      handlers: {
        GET: async () => {
          try {
            const containers = await prisma.container.findMany({
              include: {
                items: true,
              },
            });
            return NextResponse.json(containers);
          } catch (error) {
            console.error("Error fetching containers:", error);

            return NextResponse.json(
              {
                error: "Failed to fetch containers.",
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

            if (body.roomId) {
              const roomExists = await prisma.room.findUnique({
                where: { id: body.roomId },
              });

              if (!roomExists) {
                return NextResponse.json(
                  { error: `Room with id ${body.roomId} does not exist` },
                  { status: 400 }
                );
              }
            }

            const container = await prisma.container.create({
              data: {
                name: body.name,
                roomId: body.roomId,
                placeId: body.placeId,
              },
            });

            return NextResponse.json(container);
          } catch (error) {
            console.error("Error creating container:", error);

            return NextResponse.json(
              {
                error: "Failed to create container.",
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

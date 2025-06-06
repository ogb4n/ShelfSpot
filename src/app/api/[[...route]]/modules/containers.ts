import { NextResponse } from "next/server";
import { ApiModule } from "../types";
import { prisma } from "@/app/utils/prisma";
import * as z from "zod";

export const containersModule: ApiModule = {
  routes: [
    {
      path: "container",
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
        DELETE: async (req) => {
          const containerDeleteSchema = z.object({
            id: z.number(),
          });
          try {
            const { id } = containerDeleteSchema.parse(await req.json());
            const existingContainer = await prisma.container.findUnique({
              where: { id },
            });
            if (!existingContainer) {
              return NextResponse.json(
                { message: "Container not found" },
                { status: 404 }
              );
            }
            await prisma.container.delete({ where: { id } });
            return NextResponse.json({
              message: "Container deleted successfully",
            });
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "An unknown error occurred";
            return NextResponse.json(
              { message: errorMessage },
              { status: 500 }
            );
          }
        },
        POST: async (req) => {
          try {
            const body = await req.json();

            if (body.placeId) {
              const placeExists = await prisma.place.findUnique({
                where: { id: body.placeId },
              });

              if (!placeExists) {
                return NextResponse.json(
                  { error: `Place with id ${body.placeId} does not exist` },
                  { status: 400 }
                );
              }
            }

            const container = await prisma.container.create({
              data: {
                name: body.name,
                icon: body.icon || "box",
                placeId: body.placeId,
                roomId: body.roomId, // Ajout de l'enregistrement de la pièce
              },
            });

            return NextResponse.json(container);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            console.error("Error in POST /api/container/add:", error);
            return NextResponse.json(
              {
                error: "Failed to process the request",
                details: error.message,
              },
              {
                status: 500,
              }
            );
          }
        },
      },
    },
    {
      path: "container/edit",
      handlers: {
        POST: async (req) => {
          const body = await req.json();

          if (!body || typeof body !== "object") {
            return NextResponse.json(
              { error: "Invalid request body" },
              { status: 400 }
            );
          }

          const containerId = body.id;
          const containerExists = await prisma.container.findUnique({
            where: { id: containerId },
          });

          if (!containerExists) {
            return NextResponse.json(
              { error: `Container with ID ${containerId} does not exist.` },
              { status: 404 }
            );
          }

          const updatedContainer = await prisma.container.update({
            where: { id: containerId },
            data: {
              name: body.name,
              icon: body.icon,
              placeId: body.placeId || undefined,
              roomId: body.roomId || undefined,
            },
          });

          return NextResponse.json(updatedContainer);
        },
      },
    },
  ],
};

import { NextResponse } from "next/server";
import { ApiModule } from "../types";
import { prisma } from "@/app/utils/prisma";

export const placesModule: ApiModule = {
  routes: [
    {
      path: "place",
      handlers: {
        GET: async () => {
          try {
            const places = await prisma.place.findMany({
              include: {
                items: true,
              },
            });
            return NextResponse.json(places);
          } catch (error) {
            console.error("Error fetching places:", error);

            return NextResponse.json(
              {
                error: "Failed to fetch places.",
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

            const place = await prisma.place.create({
              data: {
                name: body.name,
                icon: body.icon,
                roomId: body.roomId,
              },
            });

            return NextResponse.json(place);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            console.error("Error in POST /api/place:", error);
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
      path: "place/:id",
      handlers: {
        DELETE: async (req, params) => {
          try {
            const id = parseInt(params.id);
            if (!id) {
              return NextResponse.json(
                { error: "Invalid place ID" },
                { status: 400 }
              );
            }

            const existingPlace = await prisma.place.findUnique({
              where: { id },
            });
            if (!existingPlace) {
              return NextResponse.json(
                { message: "Place not found" },
                { status: 404 }
              );
            }
            await prisma.place.delete({ where: { id } });
            return NextResponse.json({ message: "Place deleted successfully" });
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
        PUT: async (req, params) => {
          try {
            const id = parseInt(params.id);
            if (!id) {
              return NextResponse.json(
                { error: "Invalid place ID" },
                { status: 400 }
              );
            }

            const body = await req.json();

            if (!body || typeof body !== "object") {
              return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
              );
            }

            const placeExists = await prisma.place.findUnique({
              where: { id },
            });

            if (!placeExists) {
              return NextResponse.json(
                { error: `Place with ID ${id} does not exist.` },
                { status: 404 }
              );
            }

            const updatedPlace = await prisma.place.update({
              where: { id },
              data: {
                name: body.name,
                icon: body.icon,
              },
            });

            return NextResponse.json(updatedPlace);
          } catch (error) {
            console.error("Error updating place:", error);
            return NextResponse.json(
              {
                error: "Failed to update place.",
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

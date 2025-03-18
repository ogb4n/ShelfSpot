import { NextResponse } from "next/server";
import { ApiModule } from "../types";
import { prisma } from "@/app/utils/prisma";
import * as z from "zod";

export const placesModule: ApiModule = {
  routes: [
    {
      path: "places",
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
      },
    },
    {
      path: "places/add",
      handlers: {
        POST: async (req) => {
          try {
            const body = await req.json();
            console.log("Parsed body:", body);

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
            console.error("Error in POST /api/places/add:", error);
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
      path: "places/delete",
      handlers: {
        DELETE: async (req) => {
          const placeDeleteSchema = z.object({
            id: z.number(),
          });
          try {
            const { id } = placeDeleteSchema.parse(await req.json());
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
      },
    },
    {
      path: "places/edit",
      handlers: {
        POST: async (req) => {
          const body = await req.json();

          if (!body || typeof body !== "object") {
            return NextResponse.json(
              { error: "Invalid request body" },
              { status: 400 }
            );
          }

          const placeId = body.id;
          const placeExists = await prisma.place.findUnique({
            where: { id: placeId },
          });

          if (!placeExists) {
            return NextResponse.json(
              { error: `Place with ID ${placeId} does not exist.` },
              { status: 404 }
            );
          }

          const updatedPlace = await prisma.place.update({
            where: { id: placeId },
            data: {
              name: body.name,
              icon: body.icon,
            },
          });

          return NextResponse.json(updatedPlace);
        },
      },
    },
  ],
};

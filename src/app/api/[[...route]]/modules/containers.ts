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
                roomId: body.roomId,
              },
            });

            return NextResponse.json(container);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            console.error("Error in POST /api/container:", error);
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
      path: "container/:id",
      handlers: {
        DELETE: async (req, params) => {
          try {
            const id = parseInt(params.id);
            if (!id) {
              return NextResponse.json(
                { error: "Invalid container ID" },
                { status: 400 }
              );
            }

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
        PUT: async (req, params) => {
          try {
            const id = parseInt(params.id);
            if (!id) {
              return NextResponse.json(
                { error: "Invalid container ID" },
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

            const containerExists = await prisma.container.findUnique({
              where: { id },
            });

            if (!containerExists) {
              return NextResponse.json(
                { error: `Container with ID ${id} does not exist.` },
                { status: 404 }
              );
            }

            const updatedContainer = await prisma.container.update({
              where: { id },
              data: {
                name: body.name,
                icon: body.icon,
                placeId: body.placeId || undefined,
                roomId: body.roomId || undefined,
              },
            });

            return NextResponse.json(updatedContainer);
          } catch (error) {
            console.error("Error updating container:", error);
            return NextResponse.json(
              {
                error: "Failed to update container.",
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

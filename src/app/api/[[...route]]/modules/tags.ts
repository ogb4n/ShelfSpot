import { NextResponse } from "next/server";
import { ApiModule } from "../types";
import { prisma } from "@/app/utils/prisma";

export const tagsModule: ApiModule = {
  routes: [
    {
      path: "tag",
      handlers: {
        GET: async () => {
          try {
            const tags = await prisma.tag.findMany();
            return NextResponse.json(tags);
          } catch (error) {
            console.error("Error fetching tags:", error);

            return NextResponse.json(
              {
                error: "Failed to fetch tags.",
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
            const tag = await prisma.tag.create({
              data: {
                name: body.name,
              },
            });

            return NextResponse.json(tag);
          } catch (error) {
            console.error("Error creating tag:", error);

            return NextResponse.json(
              {
                error: "Failed to create tag.",
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
      path: "tag/:id",
      handlers: {
        DELETE: async (req, params) => {
          try {
            const id = parseInt(params.id);
            if (!id) {
              return NextResponse.json(
                { error: "Invalid tag ID" },
                { status: 400 }
              );
            }

            const tag = await prisma.tag.delete({
              where: {
                id: id,
              },
            });

            return NextResponse.json(tag);
          } catch (error) {
            console.error("Error deleting tag:", error);

            return NextResponse.json(
              {
                error: "Failed to delete tag.",
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
                { error: "Invalid tag ID" },
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

            const tagExists = await prisma.tag.findUnique({
              where: { id },
            });

            if (!tagExists) {
              return NextResponse.json(
                { error: `Tag with ID ${id} does not exist.` },
                { status: 404 }
              );
            }

            const updatedTag = await prisma.tag.update({
              where: { id },
              data: {
                name: body.name,
              },
            });

            return NextResponse.json(updatedTag);
          } catch (error) {
            console.error("Error updating tag:", error);

            return NextResponse.json(
              {
                error: "Failed to update tag.",
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

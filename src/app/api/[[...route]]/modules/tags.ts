import { NextResponse } from "next/server";
import { ApiModule } from "../types";
import { prisma } from "@/app/utils/prisma";

export const tagsModule: ApiModule = {
  routes: [
    {
      path: "tags",
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
      },
    },
    {
      path: "tags/add",
      handlers: {
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
      path: "tags/delete",
      handlers: {
        DELETE: async (req) => {
          try {
            const body = await req.json();
            console.log("Parsed body:", body);

            const tag = await prisma.tag.delete({
              where: {
                id: body.id,
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
      },
    },
  ],
};

import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      include: {
        room: true,
      },
      where: {
        consumable: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch items.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

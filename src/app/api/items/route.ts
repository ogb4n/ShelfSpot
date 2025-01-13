import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      include: {
        room: true, // Inclut les informations de la place associée
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);

    // Assurez-vous que la réponse JSON contient un objet valide
    return NextResponse.json(
      {
        error: "Failed to fetch items.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

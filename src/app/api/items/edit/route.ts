import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  // Vérifiez si `placeId` est fourni
  if (!body.placeId) {
    return NextResponse.json(
      { error: "placeId is required." },
      { status: 400 }
    );
  }

  try {
    const item = await prisma.item.update({
      where: {
        id: body.id, // Identifiant de l'objet à mettre à jour
      },
      data: {
        name: body.name,
        stock: body.stock,
        price: body.price,
        room: {
          connect: { id: body.roomId }, // Connecte la room si `roomId` est fourni
        },
        placeId: body.placeId, // Met à jour l'ID de la place
        status: body.status,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "An error occurred while updating the item." },
      { status: 500 }
    );
  }
}

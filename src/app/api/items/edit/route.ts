import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    const item = await prisma.item.update({
      where: { id: body.id },
      data: {
        name: body.name ?? "",
        quantity: Number(body.quantity) || 0,
        placeId: body.placeId,
        status: body.status ?? "",
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

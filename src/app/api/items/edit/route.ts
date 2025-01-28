import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const item = await prisma.item.update({
      where: {
        id: body.id,
      },
      data: {
        name: body.name,
        stock: body.stock,
        price: body.price,
        tags: body.tags,
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

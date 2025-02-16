import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";
import { Item } from "@/app/utils/types";

export async function POST(req: Request) {
  try {
    const { name, stock, price, status, roomId, placeId, tags }: Item =
      await req.json();

    const tagsToString = tags?.join(",");

    if (!name || !roomId) {
      return NextResponse.json(
        { error: "The fields 'name' and 'roomId' are required." },
        { status: 400 }
      );
    }

    if (placeId) {
      const placeExists = await prisma.place.findUnique({
        where: { id: placeId },
      });
      if (!placeExists) {
        return NextResponse.json(
          { error: `Place with ID ${placeId} does not exist.` },
          { status: 404 }
        );
      }
    }

    const item = await prisma.item.create({
      data: {
        name: name,
        stock: stock,
        price: price,
        status: status,
        roomId: roomId,
        tags: tagsToString,
        placeId: placeId,
      },
      include: {
        room: true,
        place: true,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item. Please try again later." },
      { status: 500 }
    );
  }
}

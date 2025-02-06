import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  try {
    const { name, stock, price, status, roomId, placeId, tags } =
      await req.json();
    console.log(name, stock, price, status, roomId, placeId, tags);

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
        stock: stock ?? 0,
        price: price ?? 0,
        status: status,
        roomId: roomId,
        // tags: tags,
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

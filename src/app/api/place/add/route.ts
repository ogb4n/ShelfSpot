import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Parsed body:", body);

    if (body.roomId) {
      const roomExists = await prisma.room.findUnique({
        where: { id: body.roomId },
      });

      if (!roomExists) {
        return NextResponse.json(
          { error: `Room with id ${body.roomId} does not exist` },
          { status: 400 }
        );
      }
    }

    const place = await prisma.place.create({
      data: {
        name: body.name,
        icon: body.icon,
        roomId: body.roomId,
      },
    });

    return NextResponse.json(place);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error in POST /api/place/add:", error);
    return NextResponse.json(
      { error: "Failed to process the request", details: error.message },
      {
        status: 500,
      }
    );
  }
}

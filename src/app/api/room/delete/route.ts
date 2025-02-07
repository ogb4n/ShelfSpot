import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const places = await prisma.place.deleteMany({
    where: {
      roomId: body.id,
    },
  });

  const room = await prisma.room.delete({
    where: {
      id: body.id,
    },
  });

  return NextResponse.json(`${room.name} and ${places.count} deleted`);
}

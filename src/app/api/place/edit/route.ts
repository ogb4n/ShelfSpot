import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const place = await prisma.place.update({
    where: {
      id: body.id,
    },
    data: {
      name: body.name,
      icon: body.icon,
      roomId: body.roomId,
    },
  });

  return NextResponse.json(place);
}

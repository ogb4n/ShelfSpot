import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const room = await prisma.room.create({
    data: {
      name: body.name,
      icon: body.icon,
    },
  });

  return NextResponse.json(room);
}

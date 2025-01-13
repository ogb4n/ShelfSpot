import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const place = await prisma.place.delete({
    where: {
      id: body.id,
    },
  });

  return NextResponse.json(place);
}

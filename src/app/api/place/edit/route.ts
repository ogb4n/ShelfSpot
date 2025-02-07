import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updatedPlace = await prisma.place.update({
      where: { id: body.id },
      data: {
        name: body.name,
        icon: body.icon,
      },
    });
    return NextResponse.json(updatedPlace);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to edit place", details: err.message },
      { status: 500 }
    );
  }
}

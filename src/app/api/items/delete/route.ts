import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") as string, 10);

  const item = await prisma.item.delete({
    where: {
      id,
    },
  });

  return NextResponse.json(item);
}

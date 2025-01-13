import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function GET() {
  const items = await prisma.room.findMany();
  return NextResponse.json(items);
}

import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function GET() {
  const tags = await prisma.tags.findMany();
  return NextResponse.json(tags);
}

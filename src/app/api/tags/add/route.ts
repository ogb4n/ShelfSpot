import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  try {
    const { name, icon } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const tag = await prisma.tags.create({ data: { name, icon } });
    return NextResponse.json(tag);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to add tag : ${error}` },
      { status: 500 }
    );
  }
}

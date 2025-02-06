import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const deleted = await prisma.tags.delete({ where: { id } });
    return NextResponse.json(deleted);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { error: `Failed to delete tag: ${error}` },
      { status: 500 }
    );
  }
}

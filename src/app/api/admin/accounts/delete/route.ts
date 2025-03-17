import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/utils/prisma";
import { authOptions } from "@/app/utils/auth";
import * as z from "zod";

const userDeleteSchema = z.object({
  id: z.number(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.admin) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  try {
    const { id } = userDeleteSchema.parse(await req.json());
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

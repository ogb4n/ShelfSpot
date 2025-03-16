import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/utils/prisma";
import { authOptions } from "@/app/utils/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.admin) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  try {
    const accounts = await prisma.user.findMany();
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json(
      { message: `Internal server error : ${error}` },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function GET(req: Request) {
  const params = new URLSearchParams(req.url.split("?")[1]);
  const userId = params.get("userId");
  if (!userId) {
    return NextResponse.json(
      { error: "Missing required parameter 'userId'" },
      { status: 400 }
    );
  }
  const wallets = await prisma.wallet.findMany({
    where: {
      userId: parseInt(userId),
    },
  });

  return NextResponse.json(wallets);
}

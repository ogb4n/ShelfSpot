import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  console.log(body);
  const { walletId, name } = body;
  if (!walletId || !name) {
    return NextResponse.json(
      { error: "Missing parameter(s) 'walletId' or 'name'" },
      { status: 400 }
    );
  }
  const updated = await prisma.wallet.update({
    where: { id: parseInt(walletId) },
    data: { name },
  });
  return NextResponse.json(updated);
}

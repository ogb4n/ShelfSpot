import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function DELETE(req: Request) {
  const body = await req.json();
  const walletId = body.walletId;

  const item = await prisma.wallet.delete({
    where: {
      id: walletId,
    },
  });

  return NextResponse.json(item);
}

import { NextResponse } from "next/server";
import * as zod from "zod";
import { prisma } from "@/app/utils/prisma";

export async function POST(req: Request) {
  const schema = zod.object({
    amount: zod.number(),
    description: zod.string(),
    walletId: zod.number(),
  });

  const body = await req.json();
  const data = schema.parse(body);

  try {
    const outcome = await prisma.outcome.create({
      data: {
        walletId: data.walletId,
        description: data.description,
        amount: data.amount,
        createdAt: new Date(),
      },
    });
    return NextResponse.json(outcome);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
}

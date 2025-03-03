import { NextResponse } from "next/server";
import * as zod from "zod";
import { prisma } from "@/app/utils/prisma";
const addIncome = async (req: Request) => {
  const schema = zod.object({
    amount: zod.number(),
    description: zod.string(),
    walletId: zod.number(),
    userId: zod.number(),
  });
  const data = schema.parse(req.body);

  try {
    const income = await prisma.income.create({
      data: {
        walletId: data.walletId,
        amount: data.amount,
        createdAt: new Date(),
      },
    });
    return NextResponse.json(income);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return NextResponse.error();
  }
};

export default addIncome;

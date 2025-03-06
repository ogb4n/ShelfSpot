import { NextResponse } from "next/server";
import * as zod from "zod";
import { prisma } from "@/app/utils/prisma";

export async function PUT(req: Request) {
  const schema = zod.object({
    id: zod.number(),
    description: zod.string(),
  });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const updatedIncome = await prisma.income.update({
      where: { id: data.id },
      data: { description: data.description },
    });

    return NextResponse.json(updatedIncome);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}

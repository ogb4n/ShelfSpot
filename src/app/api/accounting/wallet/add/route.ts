import { prisma } from "@/app/utils/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(body.userId) },
    });
    if (!userExists) {
      return NextResponse.json(
        { error: `User with id ${body.userId} does not exist` },
        { status: 400 }
      );
    }

    // Création du wallet
    const wallet = await prisma.wallet.create({
      data: {
        user: {
          connect: {
            id: parseInt(body.userId),
          },
        },
        balance: body.balance,
        name: body.name,
      },
    });

    return NextResponse.json(wallet);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Erreur lors de la création du wallet:", error);
    return NextResponse.json(
      { error: "Failed to process the request", details: error.message },
      {
        status: 500,
      }
    );
  }
}

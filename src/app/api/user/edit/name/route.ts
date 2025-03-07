import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId, name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Le nom est requis." },
        { status: 400 }
      );
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name,
      },
    });

    return NextResponse.json(
      { message: "Nom mis à jour avec succès.", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user name:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du nom." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';

export async function GET() {
  try {
    const containers = await prisma.container.findMany({
      include: {
        items: true,
      },
    });
    return NextResponse.json(containers);
  } catch (error) {
    console.error("Error fetching containers:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch containers.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
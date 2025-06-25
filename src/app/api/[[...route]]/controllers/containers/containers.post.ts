import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';

export async function POST(request: NextRequest, params: Record<string, string>) {
    try {
        const body = await request.json();

        if (body.placeId) {
            const placeExists = await prisma.place.findUnique({
                where: { id: body.placeId },
            });

            if (!placeExists) {
                return NextResponse.json(
                    { error: `Place with id ${body.placeId} does not exist` },
                    { status: 400 }
                );
            }
        }

        const container = await prisma.container.create({
            data: {
                name: body.name,
                icon: body.icon || "box",
                placeId: body.placeId,
                roomId: body.roomId,
            },
        });

        return NextResponse.json(container);
    } catch (error: any) {
        console.error("Error in POST /api/container:", error);
        return NextResponse.json(
            {
                error: "Failed to process the request",
                details: error.message,
            },
            {
                status: 500,
            }
        );
    }
}
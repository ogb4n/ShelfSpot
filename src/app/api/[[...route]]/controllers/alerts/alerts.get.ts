import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';


// GET /api/alerts?itemId=123 - Récupérer les alertes d'un objet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    const alerts = await prisma.alert.findMany({
      where: {
        itemId: parseInt(itemId),
      },
      orderBy: {
        threshold: 'asc',
      },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

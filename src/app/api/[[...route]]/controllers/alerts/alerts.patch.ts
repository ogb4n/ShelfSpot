import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';

// PATCH /api/alerts/:id - Mettre à jour une alerte (activer/désactiver)
export async function PATCH(request: NextRequest, params: Record<string, string>) {
  try {
    const alertId = parseInt(params.id);
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
    }

    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: { isActive },
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}
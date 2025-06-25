import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';

// DELETE /api/alerts/:id - Supprimer une alerte
export async function DELETE_ALERT(request: NextRequest, params: Record<string, string>) {
  try {
    const alertId = parseInt(params.id);

    await prisma.alert.delete({
      where: { id: alertId },
    });

    return NextResponse.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}
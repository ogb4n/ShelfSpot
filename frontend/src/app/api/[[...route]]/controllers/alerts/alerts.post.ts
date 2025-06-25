import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/utils/prisma';
import { sendTriggeredAlerts } from '@/lib/email';


// POST /api/alerts - Créer une nouvelle alerte
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, threshold, name } = body;

    if (!itemId || !threshold) {
      return NextResponse.json({ error: 'itemId and threshold are required' }, { status: 400 });
    }

    // Vérifier que l'objet existe
    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId) },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Créer l'alerte
    const alert = await prisma.alert.create({
      data: {
        itemId: parseInt(itemId),
        threshold: parseInt(threshold),
        name: name || null,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    
    // Gérer l'erreur de contrainte unique
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'An alert with this threshold already exists for this item' },
        { status: 409 }
      );
    }
    
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}
// POST /api/alerts/check - Vérifier toutes les alertes et envoyer des emails si nécessaire
export async function CHECK_ALERTS(request: NextRequest) {
  try {
    // Récupérer toutes les alertes actives avec leurs items complets
    const alerts = await prisma.alert.findMany({
      where: {
        isActive: true,
      },
      include: {
        item: {
          include: {
            room: true,
            place: true,
            container: true,
            itemTags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    // Filtrer les alertes déclenchées (quantity <= threshold)
    const triggeredAlerts = alerts.filter(alert => alert.item.quantity <= alert.threshold);

    if (triggeredAlerts.length === 0) {
      return NextResponse.json({ 
        message: 'No alerts triggered',
        checkedAlerts: alerts.length 
      });
    }

    // Filtrer les alertes qui n'ont pas été envoyées récemment (moins de 24h)
    const now = new Date();
    const alertsToSend = triggeredAlerts.filter(alert => {
      if (!alert.lastSent) return true;
      
      const lastSent = new Date(alert.lastSent);
      const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
      
      return hoursSinceLastSent >= 24; // Envoyer seulement si > 24h depuis le dernier envoi
    });

    if (alertsToSend.length === 0) {
      return NextResponse.json({ 
        message: 'Alerts triggered but emails already sent recently',
        triggeredAlerts: triggeredAlerts.length 
      });
    }

    // Envoyer l'email
    await sendTriggeredAlerts(
      alertsToSend.map(alert => ({
        alert: {
          id: alert.id,
          itemId: alert.itemId,
          threshold: alert.threshold,
          name: alert.name,
          isActive: alert.isActive,
          lastSent: alert.lastSent?.toISOString(),
          createdAt: alert.createdAt.toISOString(),
          updatedAt: alert.updatedAt.toISOString(),
        },
        item: {
          id: alert.item.id,
          name: alert.item.name,
          quantity: alert.item.quantity,
          status: alert.item.status,
        },
      }))
    );

    // Mettre à jour la date du dernier envoi pour toutes les alertes envoyées
    await prisma.alert.updateMany({
      where: {
        id: {
          in: alertsToSend.map(alert => alert.id),
        },
      },
      data: {
        lastSent: now,
      },
    });

    return NextResponse.json({
      message: 'Alerts sent successfully',
      sentAlerts: alertsToSend.length,
      triggeredAlerts: triggeredAlerts.length,
      checkedAlerts: alerts.length,
    });

  } catch (error) {
    console.error('Error checking alerts:', error);
    return NextResponse.json({ error: 'Failed to check alerts' }, { status: 500 });
  }
}
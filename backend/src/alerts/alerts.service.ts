import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { CreateAlertDto, UpdateAlertDto } from './dto/alert.dto';

@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createAlertDto: CreateAlertDto) {
    // Vérifier que l'item existe
    const item = await this.prisma.item.findUnique({
      where: { id: createAlertDto.itemId },
    });

    if (!item) {
      throw new NotFoundException(
        `Item with ID ${createAlertDto.itemId} not found`,
      );
    }

    try {
      return await this.prisma.alert.create({
        data: createAlertDto,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              quantity: true,
              status: true,
            },
          },
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          'An alert with this threshold already exists for this item',
        );
      }
      throw error;
    }
  }

  async findAllByItem(itemId: number) {
    return this.prisma.alert.findMany({
      where: { itemId },
      orderBy: { threshold: 'asc' },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            quantity: true,
            status: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.alert.findMany({
      include: {
        item: {
          select: {
            id: true,
            name: true,
            quantity: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            quantity: true,
            status: true,
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }

    return alert;
  }

  async update(id: number, updateAlertDto: UpdateAlertDto) {
    try {
      return await this.prisma.alert.update({
        where: { id },
        data: updateAlertDto,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              quantity: true,
              status: true,
            },
          },
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Alert with ID ${id} not found`);
      }
      if (error?.code === 'P2002') {
        throw new ConflictException(
          'An alert with this threshold already exists for this item',
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.alert.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Alert with ID ${id} not found`);
      }
      throw error;
    }
  }

  async checkAlerts() {
    // Récupérer toutes les alertes actives avec leurs items
    const alerts = await this.prisma.alert.findMany({
      where: { isActive: true },
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
    const triggeredAlerts = alerts.filter(
      (alert) => alert.item.quantity <= alert.threshold,
    );

    if (triggeredAlerts.length === 0) {
      return {
        message: 'No alerts triggered',
        checkedAlerts: alerts.length,
        triggeredAlerts: 0,
        sentAlerts: 0,
      };
    }

    // Filtrer les alertes qui n'ont pas été envoyées récemment (moins de 24h)
    const now = new Date();
    const alertsToSend = triggeredAlerts.filter((alert) => {
      if (!alert.lastSent) return true;

      const lastSent = new Date(alert.lastSent);
      const hoursSinceLastSent =
        (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

      return hoursSinceLastSent >= 24;
    });

    if (alertsToSend.length === 0) {
      return {
        message: 'Alerts triggered but emails already sent recently',
        checkedAlerts: alerts.length,
        triggeredAlerts: triggeredAlerts.length,
        sentAlerts: 0,
      };
    }

    // Envoyer les emails d'alerte
    const emailRecipient = process.env.ALERT_EMAIL_RECIPIENT;
    if (emailRecipient && alertsToSend.length > 0) {
      try {
        const emailData = alertsToSend.map((alert) => ({
          id: alert.id,
          threshold: alert.threshold,
          name: alert.name,
          item: alert.item,
        }));

        await this.emailService.sendAlertEmail(emailRecipient, emailData);
      } catch (error) {
        console.error('Error sending alert emails:', error);
        // Ne pas faire échouer la fonction si l'email échoue
      }
    }

    // Mettre à jour la date du dernier envoi
    await this.prisma.alert.updateMany({
      where: {
        id: {
          in: alertsToSend.map((alert) => alert.id),
        },
      },
      data: {
        lastSent: now,
      },
    });

    return {
      message: 'Alerts processed successfully',
      checkedAlerts: alerts.length,
      triggeredAlerts: triggeredAlerts.length,
      sentAlerts: alertsToSend.length,
    };
  }

  /**
   * Vérifie les alertes pour un item spécifique après modification de sa quantité
   * @param itemId ID de l'item modifié
   * @param newQuantity Nouvelle quantité de l'item
   */
  async checkItemAlerts(itemId: number, newQuantity: number) {
    // Récupérer toutes les alertes actives pour cet item
    const alerts = await this.prisma.alert.findMany({
      where: {
        itemId,
        isActive: true,
      },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            quantity: true,
            status: true,
          },
        },
      },
    });

    if (alerts.length === 0) {
      return {
        message: 'No alerts configured for this item',
        triggeredAlerts: 0,
        sentAlerts: 0,
      };
    }

    // Filtrer les alertes déclenchées (newQuantity <= threshold)
    const triggeredAlerts = alerts.filter(
      (alert) => newQuantity <= alert.threshold,
    );

    if (triggeredAlerts.length === 0) {
      return {
        message: 'No alerts triggered for this item',
        triggeredAlerts: 0,
        sentAlerts: 0,
      };
    }

    // Filtrer les alertes qui n'ont pas été envoyées récemment (moins de 24h)
    const now = new Date();
    const alertsToSend = triggeredAlerts.filter((alert) => {
      if (!alert.lastSent) return true;

      const lastSent = new Date(alert.lastSent);
      const hoursSinceLastSent =
        (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

      return hoursSinceLastSent >= 24;
    });

    if (alertsToSend.length === 0) {
      return {
        message: 'Alerts triggered but emails already sent recently',
        triggeredAlerts: triggeredAlerts.length,
        sentAlerts: 0,
      };
    }

    // Envoyer les emails d'alerte pour cet item spécifique
    const emailRecipient = process.env.ALERT_EMAIL_RECIPIENT;
    if (emailRecipient && alertsToSend.length > 0) {
      try {
        const emailData = alertsToSend.map((alert) => ({
          id: alert.id,
          threshold: alert.threshold,
          name: alert.name,
          item: alert.item,
        }));

        await this.emailService.sendAlertEmail(emailRecipient, emailData, {
          subject: `🚨 Alerte stock faible - ${alertsToSend[0].item.name} (quantité: ${newQuantity})`,
        });
      } catch (error) {
        console.error(`Error sending alert emails for item ${itemId}:`, error);
        // Ne pas faire échouer la fonction si l'email échoue
      }
    }

    // Log des alertes déclenchées
    console.log(`🚨 ALERT TRIGGERED for item ${itemId}:`);
    console.log(`   - New quantity: ${newQuantity}`);
    console.log(`   - Alerts triggered: ${alertsToSend.length}`);
    alertsToSend.forEach((alert) => {
      console.log(
        `   - Alert ID ${alert.id}: threshold ${alert.threshold}, name: "${alert.name || 'Unnamed alert'}"`,
      );
    });

    // Mettre à jour la date du dernier envoi
    await this.prisma.alert.updateMany({
      where: {
        id: {
          in: alertsToSend.map((alert) => alert.id),
        },
      },
      data: {
        lastSent: now,
      },
    });

    return {
      message: 'Item alerts processed successfully',
      triggeredAlerts: triggeredAlerts.length,
      sentAlerts: alertsToSend.length,
      alerts: alertsToSend.map((alert) => ({
        id: alert.id,
        threshold: alert.threshold,
        name: alert.name,
      })),
    };
  }

  /**
   * Envoie un email de test pour vérifier la configuration
   */
  async sendTestEmail(
    email?: string,
  ): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
    message?: string;
  }> {
    const recipient = email || process.env.ALERT_EMAIL_RECIPIENT;

    if (!recipient) {
      return {
        success: false,
        error:
          'No email recipient configured. Set ALERT_EMAIL_RECIPIENT in environment variables or provide email parameter.',
      };
    }

    try {
      const result = await this.emailService.sendTestEmail(recipient);

      if (result.success) {
        return {
          success: true,
          messageId: result.messageId,
          message: `Test email sent successfully to ${recipient}`,
        };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

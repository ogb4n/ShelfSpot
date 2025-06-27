import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConsumablesService {
  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService,
  ) {}

  private transformItem(item: any) {
    if (!item) {
      return null;
    }
    const { itemTags, ...rest } = item;
    const tags = itemTags ? itemTags.map((it: any) => it.tag.name) : [];
    return {
      ...rest,
      tags,
    };
  }

  async findAll() {
    const items = await this.prisma.item.findMany({
      where: {
        consumable: true,
      },
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
    });
    return items.map((item) => this.transformItem(item));
  }

  async findOne(id: number) {
    const item = await this.prisma.item.findUnique({
      where: {
        id,
        consumable: true,
      },
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
    });
    return this.transformItem(item);
  }

  async create(data: Prisma.ItemCreateInput) {
    const item = await this.prisma.item.create({
      data: {
        ...data,
        consumable: true,
      },
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
    });

    // Vérifier les alertes pour le nouveau consommable
    if (typeof data.quantity === 'number') {
      // Vérifier les alertes de manière asynchrone sans bloquer la réponse
      this.alertsService
        .checkItemAlerts(item.id, data.quantity)
        .catch((error) => {
          console.error(
            `Error checking alerts for new consumable ${item.id}:`,
            error,
          );
        });
    }

    return this.transformItem(item);
  }

  async update(id: number, data: Prisma.ItemUpdateInput) {
    // Récupérer l'ancienne quantité avant la mise à jour
    const oldItem = await this.prisma.item.findUnique({
      where: { id, consumable: true },
      select: { quantity: true },
    });

    const item = await this.prisma.item.update({
      where: {
        id,
        consumable: true,
      },
      data: {
        ...data,
        consumable: true,
      },
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
    });

    // Vérifier les alertes si la quantité a changé
    if (
      data.quantity !== undefined &&
      oldItem &&
      typeof data.quantity === 'number'
    ) {
      const newQuantity = data.quantity;
      if (newQuantity !== oldItem.quantity) {
        // Vérifier les alertes de manière asynchrone sans bloquer la réponse
        this.alertsService.checkItemAlerts(id, newQuantity).catch((error) => {
          console.error(`Error checking alerts for consumable ${id}:`, error);
        });
      }
    }

    return this.transformItem(item);
  }

  remove(id: number) {
    return this.prisma.item.delete({
      where: {
        id,
        consumable: true,
      },
    });
  }

  // Méthode pour obtenir les consommables avec un stock faible
  async findLowStock(threshold: number = 5) {
    const items = await this.prisma.item.findMany({
      where: {
        consumable: true,
        quantity: {
          lte: threshold,
        },
      },
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
    });
    return items.map((item) => this.transformItem(item));
  }
}

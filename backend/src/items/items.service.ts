import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { ScoringService } from '../scoring/scoring.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService,
    private scoringService: ScoringService,
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

  async create(data: Prisma.ItemCreateInput) {
    const item = await this.prisma.item.create({
      data,
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

    if (typeof data.quantity === 'number') {
      this.alertsService
        .checkItemAlerts(item.id, data.quantity)
        .catch((error) => {
          console.error(
            `Error checking alerts for new item ${item.id}:`,
            error,
          );
        });
    }

    return this.transformItem(item);
  }

  async findAll() {
    const items = await this.prisma.item.findMany({
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
      where: { id },
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

  async update(id: number, data: Prisma.ItemUpdateInput) {
    const oldItem = await this.prisma.item.findUnique({
      where: { id },
      select: { quantity: true },
    });

    const item = await this.prisma.item.update({
      where: { id },
      data,
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
          console.error(`Error checking alerts for item ${id}:`, error);
        });
      }
    }

    return this.transformItem(item);
  }

  remove(id: number) {
    return this.prisma.item.delete({
      where: { id },
    });
  }

  async search(searchTerm: string) {
    const items = await this.prisma.item.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
            },
          },
          {
            status: {
              contains: searchTerm,
            },
          },
          {
            room: {
              name: {
                contains: searchTerm,
              },
            },
          },
          {
            place: {
              name: {
                contains: searchTerm,
              },
            },
          },
        ],
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

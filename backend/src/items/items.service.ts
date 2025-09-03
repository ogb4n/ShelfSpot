import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { ScoringService } from '../scoring/scoring.service';
import { Prisma } from '@prisma/client';

// Type for item with all includes
type ItemWithIncludes = Prisma.ItemGetPayload<{
  include: {
    room: true;
    place: true;
    container: true;
    itemTags: {
      include: {
        tag: true;
      };
    };
  };
}>;

// Type for transformed item
export interface TransformedItem {
  id: number;
  name: string;
  quantity: number;
  image: string | null;
  price: number | null;
  sellprice: number | null;
  status: string | null;
  consumable: boolean;
  placeId: number | null;
  roomId: number | null;
  containerId: number | null;
  itemLink: string | null;
  importanceScore: number;
  room: { id: number; name: string; icon: string | null } | null;
  place: {
    id: number;
    name: string;
    icon: string | null;
    roomId: number | null;
  } | null;
  container: {
    id: number;
    name: string;
    icon: string | null;
    roomId: number | null;
    placeId: number | null;
  } | null;
  tags: string[];
}

// Type for inventory value response
export interface InventoryValueResponse {
  totalValue: number;
  itemsWithValue: number;
  totalItems: number;
}

@Injectable()
export class ItemsService {
  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService,
    private scoringService: ScoringService,
  ) {}

  private transformItem(item: ItemWithIncludes | null): TransformedItem | null {
    if (!item) {
      return null;
    }
    const { itemTags, ...rest } = item;
    const tags = itemTags ? itemTags.map((it) => it.tag.name) : [];
    return {
      ...rest,
      tags,
    };
  }

  async create(data: Prisma.ItemCreateInput): Promise<TransformedItem | null> {
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

  async findAll(): Promise<(TransformedItem | null)[]> {
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

  async findOne(id: number): Promise<TransformedItem | null> {
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

  async update(
    id: number,
    data: Prisma.ItemUpdateInput,
  ): Promise<TransformedItem | null> {
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

  async search(searchTerm: string): Promise<(TransformedItem | null)[]> {
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

  async getInventoryValue(): Promise<InventoryValueResponse> {
    const items = await this.prisma.item.findMany({
      select: {
        sellprice: true,
        quantity: true,
      },
    });

    let totalValue = 0;
    let itemsWithValue = 0;
    const totalItems = items.length;

    items.forEach((item) => {
      if (item.sellprice && item.sellprice > 0) {
        totalValue += item.sellprice * item.quantity;
        itemsWithValue++;
      }
    });

    return {
      totalValue: Number(totalValue.toFixed(2)),
      itemsWithValue,
      totalItems,
    };
  }
}

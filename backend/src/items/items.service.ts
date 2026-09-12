/* eslint-disable prettier/prettier */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { AlertsService } from "../alerts/alerts.service";
import { Prisma } from "@prisma/client";

// Interface for update data with tags support
interface UpdateItemData {
  name?: string;
  quantity?: number;
  status?: string;
  itemLink?: string;
  price?: number;
  sellprice?: number;
  roomId?: number;
  placeId?: number;
  containerId?: number;
  tags?: string[];
}

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
    private readonly prisma: PrismaService,
    private readonly alertsService: AlertsService
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

    if (typeof data.quantity === "number") {
      this.alertsService
        .checkItemAlerts(item.id, data.quantity)
        .catch((error) => {
          console.error(
            `Error checking alerts for new item ${item.id}:`,
            error
          );
        });
    }

    return this.transformItem(item);
  }

  async createMany(data: Prisma.ItemCreateManyInput[]) {
    const created: (TransformedItem | null)[] = [];
    for (const d of data) {
      await this.validateBulkItem(d);
      const createdItem = await this.create(this.buildBulkItemPayload(d));
      created.push(createdItem);
    }
    return created;
  }

  // Basic validation: ensure roomId provided (DTO requires it) and that
  // roomId/placeId/containerId, when given, reference existing, consistent records.
  private async validateBulkItem(
    d: Prisma.ItemCreateManyInput
  ): Promise<void> {
    if (d.roomId === undefined || d.roomId === null) {
      throw new BadRequestException(
        "roomId is required for each item in bulk create"
      );
    }

    const room = await this.prisma.room.findUnique({
      where: { id: d.roomId },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${d.roomId} not found`);
    }

    if (d.placeId) {
      await this.validateBulkItemPlace(d.placeId, d.roomId);
    }

    if (d.containerId) {
      const container = await this.prisma.container.findUnique({
        where: { id: d.containerId },
      });
      if (!container) {
        throw new NotFoundException(
          `Container with ID ${d.containerId} not found`
        );
      }
    }
  }

  private async validateBulkItemPlace(
    placeId: number,
    roomId: number
  ): Promise<void> {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });
    if (!place) {
      throw new NotFoundException(`Place with ID ${placeId} not found`);
    }
    // If place has a roomId, ensure it matches provided roomId
    if (place.roomId && place.roomId !== roomId) {
      throw new BadRequestException(
        `Place ${placeId} is not in room ${roomId} (belongs to room ${place.roomId})`
      );
    }
  }

  // Use the safe create() method to keep behaviour (includes, alerts)
  private buildBulkItemPayload(
    d: Prisma.ItemCreateManyInput
  ): Prisma.ItemCreateInput {
    return {
      name: d.name,
      quantity: (d.quantity as number) || 1,
      image: d.image || undefined,
      price: d.price || undefined,
      sellprice: d.sellprice || undefined,
      status: d.status || undefined,
      consumable: d.consumable ?? false,
      place: d.placeId ? { connect: { id: d.placeId } } : undefined,
      room: d.roomId ? { connect: { id: d.roomId } } : undefined,
      container: d.containerId
        ? { connect: { id: d.containerId } }
        : undefined,
      itemLink: d.itemLink || undefined,
    };
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
    data: UpdateItemData
  ): Promise<TransformedItem | null> {
    const oldItem = await this.prisma.item.findUnique({
      where: { id },
      select: { quantity: true },
    });

    // Extract tags from data if present
    const { tags, ...itemData } = data;

    // Update the item first
    const item = await this.prisma.item.update({
      where: { id },
      data: itemData,
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

    // Handle tags update if tags array is provided
    if (tags !== undefined && Array.isArray(tags)) {
      await this.syncItemTags(id, tags);

      // Fetch the updated item with new tags
      const updatedItem = await this.prisma.item.findUnique({
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

      if (updatedItem) {
        this.checkQuantityAlertIfChanged(id, oldItem, itemData.quantity);
        return this.transformItem(updatedItem);
      }
    }

    this.checkQuantityAlertIfChanged(id, oldItem, itemData.quantity);
    return this.transformItem(item);
  }

  private async syncItemTags(itemId: number, tags: string[]): Promise<void> {
    await this.prisma.itemTag.deleteMany({
      where: { itemId },
    });

    for (const tagName of tags) {
      const tag = await this.findOrCreateTag(tagName);
      await this.prisma.itemTag.create({
        data: { itemId, tagId: tag.id },
      });
    }
  }

  private async findOrCreateTag(name: string) {
    const tag = await this.prisma.tag.findUnique({ where: { name } });
    return tag ?? (await this.prisma.tag.create({ data: { name } }));
  }

  // Fires the alert check asynchronously without blocking the response,
  // only when quantity was part of the update and actually changed.
  private checkQuantityAlertIfChanged(
    id: number,
    oldItem: { quantity: number } | null,
    newQuantity: unknown
  ): void {
    if (
      newQuantity === undefined ||
      !oldItem ||
      typeof newQuantity !== "number" ||
      newQuantity === oldItem.quantity
    ) {
      return;
    }
    this.alertsService.checkItemAlerts(id, newQuantity).catch((error) => {
      console.error(`Error checking alerts for item ${id}:`, error);
    });
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
              mode: "insensitive",
            },
          },
          {
            status: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            room: {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
          {
            place: {
              name: {
                contains: searchTerm,
                mode: "insensitive",
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
    const allItemsCount = await this.prisma.item.count();

    const items = await this.prisma.item.findMany({
      where: {
        sellprice: {
          not: null,
        },
      },
      select: {
        sellprice: true,
        quantity: true,
      },
    });

    const totalValue = items.reduce((sum, item) => {
      return sum + (item.sellprice || 0) * item.quantity;
    }, 0);

    return {
      totalValue,
      itemsWithValue: items.length,
      totalItems: allItemsCount,
    };
  }

  async getStatusStatistics() {
    // Get all items with their status
    const items = await this.prisma.item.findMany({
      select: {
        status: true,
      },
    });

    // Group items by status and normalize the data
    const statusCounts = new Map<string, number>();

    items.forEach((item) => {
      let status = item.status;

      // Normalize status values
      if (!status || status.trim() === "") {
        status = "No Status";
      } else {
        // Normalize case and common variations
        status = status.trim().toLowerCase();
        switch (status) {
          case "good":
          case "bon":
          case "available":
          case "disponible":
          case "ok":
            status = "Good";
            break;
          case "damaged":
          case "endommagé":
          case "endommage":
          case "broken":
          case "cassé":
          case "casse":
            status = "Damaged";
            break;
          case "missing":
          case "manquant":
          case "lost":
          case "perdu":
            status = "Missing";
            break;
          case "expired":
          case "expiré":
          case "expire":
          case "old":
          case "ancien":
            status = "Expired";
            break;
          default:
            // Keep the original status but capitalize first letter
            status = status.charAt(0).toUpperCase() + status.slice(1);
        }
      }

      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    // Convert to array format
    const data = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    // Sort by count descending
    data.sort((a, b) => b.count - a.count);

    return {
      data,
      total: items.length,
    };
  }
}

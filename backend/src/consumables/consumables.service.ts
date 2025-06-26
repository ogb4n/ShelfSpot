import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConsumablesService {
  constructor(private prisma: PrismaService) {}

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
    return this.transformItem(item);
  }

  async update(id: number, data: Prisma.ItemUpdateInput) {
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

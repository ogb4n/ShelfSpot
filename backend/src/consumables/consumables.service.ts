import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ConsumablesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.item.findMany({
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
  }

  findOne(id: number) {
    return this.prisma.item.findUnique({
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
  }

  create(data: Prisma.ItemCreateInput) {
    return this.prisma.item.create({
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
  }

  update(id: number, data: Prisma.ItemUpdateInput) {
    return this.prisma.item.update({
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
  findLowStock(threshold: number = 5) {
    return this.prisma.item.findMany({
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
  }
}

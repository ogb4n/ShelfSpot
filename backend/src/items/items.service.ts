import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ItemsService {
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

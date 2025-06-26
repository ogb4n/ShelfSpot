import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FavouritesService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.FavouriteCreateInput) {
    return this.prisma.favourite.create({
      data,
    });
  }

  findAll() {
    return this.prisma.favourite.findMany({
      include: {
        item: {
          include: {
            room: true,
            place: true,
            container: true,
            itemTags: { include: { tag: true } },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  findByUser(userId: number) {
    return this.prisma.favourite.findMany({
      where: { userId },
      include: {
        item: {
          include: {
            room: true,
            place: true,
            container: true,
            itemTags: { include: { tag: true } },
          },
        },
      },
    });
  }

  async createByItemAndUser(itemId: number, userName: string) {
    const user = await this.prisma.user.findFirst({
      where: { name: userName },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.create({
      item: { connect: { id: itemId } },
      user: { connect: { id: user.id } },
    });
  }

  remove(id: number) {
    return this.prisma.favourite.delete({
      where: { id },
    });
  }

  async removeByItemAndUser(itemId: number, userName: string) {
    const user = await this.prisma.user.findFirst({
      where: { name: userName },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.prisma.favourite.deleteMany({
      where: {
        itemId,
        userId: user.id,
      },
    });
  }
}

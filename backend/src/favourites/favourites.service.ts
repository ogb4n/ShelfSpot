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

  // Créer un favori avec l'ID utilisateur (string converti en number pour la DB)
  createWithUserId(itemId: number, userId: string | number) {
    const numericUserId =
      typeof userId === 'string' ? parseInt(userId, 10) : userId;

    return this.prisma.favourite.create({
      data: {
        item: { connect: { id: itemId } },
        user: { connect: { id: numericUserId } },
      },
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

  findByUser(userId: string | number) {
    const numericUserId =
      typeof userId === 'string' ? parseInt(userId, 10) : userId;

    return this.prisma.favourite.findMany({
      where: { userId: numericUserId },
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

  // Supprimer un favori en vérifiant l'utilisateur
  removeWithUserId(id: number, userId: string | number) {
    const numericUserId =
      typeof userId === 'string' ? parseInt(userId, 10) : userId;

    return this.prisma.favourite.deleteMany({
      where: {
        id,
        userId: numericUserId,
      },
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

  // Supprimer un favori par item et user ID
  removeByItemAndUserId(itemId: number, userId: string | number) {
    const numericUserId =
      typeof userId === 'string' ? parseInt(userId, 10) : userId;

    return this.prisma.favourite.deleteMany({
      where: {
        itemId,
        userId: numericUserId,
      },
    });
  }
}

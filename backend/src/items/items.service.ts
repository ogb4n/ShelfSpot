import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.ItemCreateInput) {
    return this.prisma.item.create({
      data,
    });
  }

  findAll() {
    return this.prisma.item.findMany();
  }

  findOne(id: number) {
    return this.prisma.item.findUnique({
      where: { id },
    });
  }

  update(id: number, data: Prisma.ItemUpdateInput) {
    return this.prisma.item.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.item.delete({
      where: { id },
    });
  }
}

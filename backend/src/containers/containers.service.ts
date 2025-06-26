import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateContainerDto, UpdateContainerDto } from './dto/container.dto';

@Injectable()
export class ContainersService {
  constructor(private prisma: PrismaService) {}

  async create(createContainerDto: CreateContainerDto) {
    // Vérifier que la place existe si fournie
    if (createContainerDto.placeId) {
      const place = await this.prisma.place.findUnique({
        where: { id: createContainerDto.placeId },
      });
      if (!place) {
        throw new NotFoundException(
          `Place with ID ${createContainerDto.placeId} not found`,
        );
      }
    }

    // Vérifier que la room existe si fournie
    if (createContainerDto.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: createContainerDto.roomId },
      });
      if (!room) {
        throw new NotFoundException(
          `Room with ID ${createContainerDto.roomId} not found`,
        );
      }
    }

    return this.prisma.container.create({
      data: {
        name: createContainerDto.name,
        icon: createContainerDto.icon || 'box',
        placeId: createContainerDto.placeId,
        roomId: createContainerDto.roomId,
      },
      include: {
        place: true,
        room: true,
        items: true,
      },
    });
  }

  async findAll() {
    return this.prisma.container.findMany({
      include: {
        place: true,
        room: true,
        items: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const container = await this.prisma.container.findUnique({
      where: { id },
      include: {
        place: true,
        room: true,
        items: true,
      },
    });

    if (!container) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    return container;
  }

  async update(id: number, updateContainerDto: UpdateContainerDto) {
    // Vérifier que le container existe
    const existingContainer = await this.prisma.container.findUnique({
      where: { id },
    });

    if (!existingContainer) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    // Vérifier que la place existe si fournie
    if (updateContainerDto.placeId) {
      const place = await this.prisma.place.findUnique({
        where: { id: updateContainerDto.placeId },
      });
      if (!place) {
        throw new NotFoundException(
          `Place with ID ${updateContainerDto.placeId} not found`,
        );
      }
    }

    // Vérifier que la room existe si fournie
    if (updateContainerDto.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: updateContainerDto.roomId },
      });
      if (!room) {
        throw new NotFoundException(
          `Room with ID ${updateContainerDto.roomId} not found`,
        );
      }
    }

    return this.prisma.container.update({
      where: { id },
      data: updateContainerDto,
      include: {
        place: true,
        room: true,
        items: true,
      },
    });
  }

  async remove(id: number) {
    // Vérifier que le container existe
    const existingContainer = await this.prisma.container.findUnique({
      where: { id },
    });

    if (!existingContainer) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    return this.prisma.container.delete({
      where: { id },
    });
  }
}

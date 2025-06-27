import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddItemToProjectDto,
  UpdateProjectItemDto,
} from './dto/project.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private scoringService: ScoringService,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    try {
      const project = await this.prisma.project.create({
        data: {
          ...createProjectDto,
          startDate: createProjectDto.startDate
            ? new Date(createProjectDto.startDate)
            : null,
          endDate: createProjectDto.endDate
            ? new Date(createProjectDto.endDate)
            : null,
        },
        include: {
          projectItems: {
            include: {
              item: {
                select: {
                  id: true,
                  name: true,
                  quantity: true,
                  status: true,
                  importanceScore: true,
                },
              },
            },
          },
        },
      });

      return project;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Un projet avec ce nom existe déjà');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        projectItems: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                quantity: true,
                status: true,
                importanceScore: true,
              },
            },
          },
        },
        _count: {
          select: {
            projectItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        projectItems: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                quantity: true,
                status: true,
                importanceScore: true,
                room: { select: { name: true } },
                place: { select: { name: true } },
                container: { select: { name: true } },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${id} non trouvé`);
    }

    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    try {
      const project = await this.prisma.project.update({
        where: { id },
        data: {
          ...updateProjectDto,
          startDate: updateProjectDto.startDate
            ? new Date(updateProjectDto.startDate)
            : undefined,
          endDate: updateProjectDto.endDate
            ? new Date(updateProjectDto.endDate)
            : undefined,
        },
        include: {
          projectItems: {
            include: {
              item: {
                select: {
                  id: true,
                  name: true,
                  quantity: true,
                  status: true,
                  importanceScore: true,
                },
              },
            },
          },
        },
      });

      // Recalculer les scores d'importance des items du projet si le statut ou la priorité a changé
      if (
        updateProjectDto.status !== undefined ||
        updateProjectDto.priority !== undefined
      ) {
        this.scoringService.recalculateProjectItemsScores(id).catch((error) => {
          console.error(`Error recalculating scores for project ${id}:`, error);
        });
      }

      return project;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Projet avec l'ID ${id} non trouvé`);
      }
      if (error?.code === 'P2002') {
        throw new ConflictException('Un projet avec ce nom existe déjà');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Récupérer les IDs des items du projet avant suppression
      const projectItems = await this.prisma.projectItem.findMany({
        where: { projectId: id },
        select: { itemId: true },
      });

      await this.prisma.project.delete({
        where: { id },
      });

      // Recalculer les scores des items qui étaient dans ce projet
      const itemIds = projectItems.map((pi) => pi.itemId);
      for (const itemId of itemIds) {
        this.scoringService
          .calculateItemScore(itemId)
          .then((scoreBreakdown) => {
            if (scoreBreakdown) {
              this.prisma.item
                .update({
                  where: { id: itemId },
                  data: { importanceScore: scoreBreakdown.totalScore },
                })
                .catch(console.error);
            }
          })
          .catch(console.error);
      }
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Projet avec l'ID ${id} non trouvé`);
      }
      throw error;
    }
  }

  /**
   * Ajouter un item à un projet
   */
  async addItemToProject(projectId: number, addItemDto: AddItemToProjectDto) {
    // Vérifier que le projet existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${projectId} non trouvé`);
    }

    // Vérifier que l'item existe
    const item = await this.prisma.item.findUnique({
      where: { id: addItemDto.itemId },
    });

    if (!item) {
      throw new NotFoundException(
        `Item avec l'ID ${addItemDto.itemId} non trouvé`,
      );
    }

    try {
      const projectItem = await this.prisma.projectItem.create({
        data: {
          projectId,
          itemId: addItemDto.itemId,
          quantity: addItemDto.quantity,
          isActive: addItemDto.isActive ?? true,
        },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              quantity: true,
              status: true,
              importanceScore: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true,
              priority: true,
            },
          },
        },
      });

      // Recalculer le score d'importance de l'item
      this.scoringService
        .calculateItemScore(addItemDto.itemId)
        .then((scoreBreakdown) => {
          if (scoreBreakdown) {
            this.prisma.item
              .update({
                where: { id: addItemDto.itemId },
                data: { importanceScore: scoreBreakdown.totalScore },
              })
              .catch(console.error);
          }
        })
        .catch(console.error);

      return projectItem;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          `L'item ${addItemDto.itemId} est déjà dans le projet ${projectId}`,
        );
      }
      throw error;
    }
  }

  /**
   * Modifier un item dans un projet
   */
  async updateProjectItem(
    projectId: number,
    itemId: number,
    updateDto: UpdateProjectItemDto,
  ) {
    try {
      const projectItem = await this.prisma.projectItem.update({
        where: {
          projectId_itemId: {
            projectId,
            itemId,
          },
        },
        data: updateDto,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              quantity: true,
              status: true,
              importanceScore: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              status: true,
              priority: true,
            },
          },
        },
      });

      // Recalculer le score d'importance de l'item
      this.scoringService
        .calculateItemScore(itemId)
        .then((scoreBreakdown) => {
          if (scoreBreakdown) {
            this.prisma.item
              .update({
                where: { id: itemId },
                data: { importanceScore: scoreBreakdown.totalScore },
              })
              .catch(console.error);
          }
        })
        .catch(console.error);

      return projectItem;
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(
          `Item ${itemId} non trouvé dans le projet ${projectId}`,
        );
      }
      throw error;
    }
  }

  /**
   * Retirer un item d'un projet
   */
  async removeItemFromProject(projectId: number, itemId: number) {
    try {
      await this.prisma.projectItem.delete({
        where: {
          projectId_itemId: {
            projectId,
            itemId,
          },
        },
      });

      // Recalculer le score d'importance de l'item
      this.scoringService
        .calculateItemScore(itemId)
        .then((scoreBreakdown) => {
          if (scoreBreakdown) {
            this.prisma.item
              .update({
                where: { id: itemId },
                data: { importanceScore: scoreBreakdown.totalScore },
              })
              .catch(console.error);
          }
        })
        .catch(console.error);
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(
          `Item ${itemId} non trouvé dans le projet ${projectId}`,
        );
      }
      throw error;
    }
  }

  /**
   * Obtenir les statistiques d'un projet
   */
  async getProjectStatistics(projectId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectItems: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                quantity: true,
                importanceScore: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${projectId} non trouvé`);
    }

    const totalItems = project.projectItems.length;
    const totalQuantity = project.projectItems.reduce(
      (sum, pi) => sum + pi.quantity,
      0,
    );
    const totalValue = project.projectItems.reduce((sum, pi) => {
      return sum + (pi.item.price || 0) * pi.quantity;
    }, 0);
    const averageImportanceScore =
      totalItems > 0
        ? project.projectItems.reduce(
            (sum, pi) => sum + pi.item.importanceScore,
            0,
          ) / totalItems
        : 0;

    // Items critiques (stock faible + utilisés dans ce projet)
    const criticalItems = project.projectItems.filter(
      (pi) => pi.item.quantity <= 5 && pi.isActive,
    );

    return {
      projectId,
      projectName: project.name,
      projectStatus: project.status,
      projectPriority: project.priority,
      statistics: {
        totalItems,
        totalQuantity,
        totalValue: Number(totalValue.toFixed(2)),
        averageImportanceScore: Number(averageImportanceScore.toFixed(2)),
        criticalItemsCount: criticalItems.length,
      },
      criticalItems: criticalItems.map((pi) => ({
        itemId: pi.item.id,
        itemName: pi.item.name,
        currentStock: pi.item.quantity,
        quantityUsed: pi.quantity,
        importanceScore: pi.item.importanceScore,
      })),
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ProjectStatus, ProjectPriority } from '@prisma/client';

export interface ItemScoreBreakdown {
  itemId: number;
  itemName: string;
  totalScore: number;
  breakdown: {
    activeProjectsScore: number;
    pausedProjectsScore: number;
    projectCountBonus: number;
    priorityMultiplier: number;
  };
  projectsUsage: Array<{
    projectId: number;
    projectName: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    quantityUsed: number;
    contribution: number;
  }>;
}

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calcule le score d'importance pour un item spécifique
   */
  async calculateItemScore(itemId: number): Promise<ItemScoreBreakdown | null> {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        projectItems: {
          where: { isActive: true },
          include: {
            project: true,
          },
        },
      },
    });

    if (!item) {
      return null;
    }

    return this.computeScore(item);
  }

  /**
   * Calcule et met à jour le score d'importance pour tous les items
   */
  async calculateAllItemsScores(): Promise<{
    updated: number;
    errors: number;
    topItems: ItemScoreBreakdown[];
  }> {
    this.logger.log(
      'Starting calculation of importance scores for all items...',
    );

    const items = await this.prisma.item.findMany({
      include: {
        projectItems: {
          where: { isActive: true },
          include: {
            project: true,
          },
        },
      },
    });

    let updated = 0;
    let errors = 0;
    const allScores: ItemScoreBreakdown[] = [];

    for (const item of items) {
      try {
        const scoreBreakdown = this.computeScore(item);
        allScores.push(scoreBreakdown);

        // Mettre à jour le score dans la base de données
        await this.prisma.item.update({
          where: { id: item.id },
          data: { importanceScore: scoreBreakdown.totalScore },
        });

        updated++;
      } catch (error) {
        this.logger.error(
          `Error calculating score for item ${item.id}:`,
          error,
        );
        errors++;
      }
    }

    // Trier par score décroissant et prendre le top 10
    const topItems = allScores
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10);

    this.logger.log(
      `Importance scores updated: ${updated} items, ${errors} errors`,
    );

    return { updated, errors, topItems };
  }

  /**
   * Recalcule le score d'importance pour tous les items d'un projet
   */
  async recalculateProjectItemsScores(projectId: number): Promise<{
    updated: number;
    projectName: string;
  }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectItems: {
          where: { isActive: true },
          include: {
            item: {
              include: {
                projectItems: {
                  where: { isActive: true },
                  include: { project: true },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    let updated = 0;

    for (const projectItem of project.projectItems) {
      const scoreBreakdown = this.computeScore(projectItem.item);

      await this.prisma.item.update({
        where: { id: projectItem.item.id },
        data: { importanceScore: scoreBreakdown.totalScore },
      });

      updated++;
    }

    this.logger.log(
      `Recalculated scores for ${updated} items in project "${project.name}"`,
    );

    return { updated, projectName: project.name };
  }

  /**
   * Obtient les items avec les scores d'importance les plus élevés
   */
  async getTopImportanceItems(limit: number = 20) {
    const items = await this.prisma.item.findMany({
      take: limit,
      orderBy: { importanceScore: 'desc' },
      include: {
        room: { select: { name: true } },
        place: { select: { name: true } },
        container: { select: { name: true } },
      },
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      importanceScore: item.importanceScore,
      status: item.status,
      room: item.room || undefined,
      place: item.place || undefined,
      container: item.container || undefined,
    }));
  }

  /**
   * Obtient les items critiques (score élevé + stock faible)
   */
  async getCriticalItems(maxQuantity: number = 5) {
    const items = await this.prisma.item.findMany({
      where: {
        quantity: { lte: maxQuantity },
        importanceScore: { gt: 0 },
      },
      include: {
        room: { select: { name: true } },
        place: { select: { name: true } },
        container: { select: { name: true } },
      },
      orderBy: { importanceScore: 'desc' },
      take: 50,
    });

    // Calculer le ratio de criticité (score / quantité)
    return items
      .map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        importanceScore: item.importanceScore,
        status: item.status,
        room: item.room || undefined,
        place: item.place || undefined,
        container: item.container || undefined,
        criticalityRatio: item.importanceScore / Math.max(item.quantity, 0.1),
      }))
      .sort((a, b) => b.criticalityRatio - a.criticalityRatio)
      .slice(0, 20);
  }

  /**
   * Calcule le score d'importance d'un item en fonction de ses projets
   */
  private computeScore(item: any): ItemScoreBreakdown {
    let activeProjectsScore = 0;
    let pausedProjectsScore = 0;
    let projectCountBonus = 0;
    let totalPriorityMultiplier = 0;

    const projectsUsage: ItemScoreBreakdown['projectsUsage'] = [];

    for (const projectItem of item.projectItems) {
      const project = projectItem.project;
      const quantityUsed = projectItem.quantity;

      // Multiplicateur de priorité
      const priorityMultiplier = this.getPriorityMultiplier(project.priority);

      // Score de base selon le statut du projet
      let baseScore = 0;
      if (project.status === ProjectStatus.ACTIVE) {
        baseScore = quantityUsed * priorityMultiplier;
        activeProjectsScore += baseScore;
      } else if (project.status === ProjectStatus.PAUSED) {
        baseScore = quantityUsed * priorityMultiplier * 0.3; // 30% pour les projets en pause
        pausedProjectsScore += baseScore;
      }
      // COMPLETED et CANCELLED ne contribuent pas au score

      totalPriorityMultiplier += priorityMultiplier;

      projectsUsage.push({
        projectId: project.id,
        projectName: project.name,
        status: project.status,
        priority: project.priority,
        quantityUsed,
        contribution: baseScore,
      });
    }

    // Bonus pour être utilisé dans plusieurs projets (diversification)
    const activeProjectsCount = item.projectItems.filter(
      (pi: any) => pi.project.status === ProjectStatus.ACTIVE,
    ).length;
    projectCountBonus = activeProjectsCount > 1 ? activeProjectsCount * 0.5 : 0;

    // Score total
    const totalScore = Number(
      (activeProjectsScore + pausedProjectsScore + projectCountBonus).toFixed(
        2,
      ),
    );

    return {
      itemId: item.id,
      itemName: item.name,
      totalScore,
      breakdown: {
        activeProjectsScore: Number(activeProjectsScore.toFixed(2)),
        pausedProjectsScore: Number(pausedProjectsScore.toFixed(2)),
        projectCountBonus: Number(projectCountBonus.toFixed(2)),
        priorityMultiplier: Number(
          (
            totalPriorityMultiplier / Math.max(item.projectItems.length, 1)
          ).toFixed(2),
        ),
      },
      projectsUsage,
    };
  }

  /**
   * Retourne le multiplicateur selon la priorité du projet
   */
  private getPriorityMultiplier(priority: ProjectPriority): number {
    switch (priority) {
      case ProjectPriority.CRITICAL:
        return 4.0;
      case ProjectPriority.HIGH:
        return 2.0;
      case ProjectPriority.MEDIUM:
        return 1.0;
      case ProjectPriority.LOW:
        return 0.5;
      default:
        return 1.0;
    }
  }

  /**
   * Obtient des statistiques globales sur les scores d'importance
   */
  async getScorignStatistics(): Promise<{
    totalItems: number;
    itemsWithScore: number;
    averageScore: number;
    maxScore: number;
    distribution: {
      critical: number; // > 10
      high: number; // 5-10
      medium: number; // 1-5
      low: number; // 0.1-1
      zero: number; // 0
    };
  }> {
    const items = await this.prisma.item.findMany({
      select: { importanceScore: true },
    });

    const totalItems = items.length;
    const itemsWithScore = items.filter(
      (item) => item.importanceScore > 0,
    ).length;
    const scores = items.map((item) => item.importanceScore);
    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / totalItems;
    const maxScore = Math.max(...scores);

    const distribution = {
      critical: items.filter((item) => item.importanceScore > 10).length,
      high: items.filter(
        (item) => item.importanceScore > 5 && item.importanceScore <= 10,
      ).length,
      medium: items.filter(
        (item) => item.importanceScore > 1 && item.importanceScore <= 5,
      ).length,
      low: items.filter(
        (item) => item.importanceScore > 0 && item.importanceScore <= 1,
      ).length,
      zero: items.filter((item) => item.importanceScore === 0).length,
    };

    return {
      totalItems,
      itemsWithScore,
      averageScore: Number(averageScore.toFixed(2)),
      maxScore: Number(maxScore.toFixed(2)),
      distribution,
    };
  }
}

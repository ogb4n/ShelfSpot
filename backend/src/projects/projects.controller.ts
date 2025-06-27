import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { ScoringService } from '../scoring/scoring.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  AddItemToProjectDto,
  UpdateProjectItemDto,
} from './dto/project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly scoringService: ScoringService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau projet' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'Projet créé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({
    status: 409,
    description: 'Un projet avec ce nom existe déjà',
  })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les projets' })
  @ApiResponse({
    status: 200,
    description: 'Liste des projets récupérée avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('scoring/statistics')
  @ApiOperation({
    summary: "Obtenir les statistiques globales des scores d'importance",
    description:
      "Retourne des statistiques sur la distribution des scores d'importance de tous les items",
  })
  @ApiResponse({
    status: 200,
    description: "Statistiques des scores d'importance récupérées avec succès",
    schema: {
      type: 'object',
      properties: {
        totalItems: { type: 'number' },
        itemsWithScore: { type: 'number' },
        averageScore: { type: 'number' },
        maxScore: { type: 'number' },
        distribution: {
          type: 'object',
          properties: {
            critical: { type: 'number' },
            high: { type: 'number' },
            medium: { type: 'number' },
            low: { type: 'number' },
            zero: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  getScoringStatistics() {
    return this.scoringService.getScorignStatistics();
  }

  @Get('scoring/top-items')
  @ApiOperation({
    summary: "Obtenir les items avec les scores d'importance les plus élevés",
    description:
      "Retourne la liste des items triés par score d'importance décroissant",
  })
  @ApiResponse({
    status: 200,
    description: 'Top des items par importance récupéré avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  getTopImportanceItems() {
    return this.scoringService.getTopImportanceItems(20);
  }

  @Get('scoring/critical-items')
  @ApiOperation({
    summary: 'Obtenir les items critiques (score élevé + stock faible)',
    description:
      "Retourne les items qui ont un score d'importance élevé mais un stock faible, triés par criticité",
  })
  @ApiResponse({
    status: 200,
    description: 'Items critiques récupérés avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  getCriticalItems() {
    return this.scoringService.getCriticalItems(5);
  }

  @Post('scoring/recalculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Recalculer tous les scores d'importance",
    description:
      "Lance le recalcul des scores d'importance pour tous les items de l'inventaire",
  })
  @ApiResponse({
    status: 200,
    description: 'Recalcul des scores terminé avec succès',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'number' },
        errors: { type: 'number' },
        topItems: { type: 'array' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  recalculateAllScores() {
    return this.scoringService.calculateAllItemsScores();
  }

  @Get(':id')
  @ApiOperation({ summary: "Obtenir les détails d'un projet" })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({
    status: 200,
    description: 'Détails du projet récupérés avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/statistics')
  @ApiOperation({
    summary: "Obtenir les statistiques d'un projet",
    description:
      'Retourne des statistiques détaillées sur un projet spécifique',
  })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques du projet récupérées avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  getProjectStatistics(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.getProjectStatistics(id);
  }

  @Get(':id/scoring/breakdown')
  @ApiOperation({
    summary:
      "Obtenir le détail des scores d'importance pour les items d'un projet",
    description:
      "Retourne le détail du calcul des scores d'importance pour tous les items utilisés dans un projet",
  })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({
    status: 200,
    description: 'Détail des scores récupéré avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  async getProjectScoringBreakdown(
    @Param('id', ParseIntPipe) projectId: number,
  ) {
    const project = await this.projectsService.findOne(projectId);
    const scores: any[] = [];

    for (const projectItem of project.projectItems) {
      const scoreBreakdown = await this.scoringService.calculateItemScore(
        projectItem.item.id,
      );
      if (scoreBreakdown) {
        scores.push({
          ...scoreBreakdown,
          quantityUsedInProject: projectItem.quantity,
          isActiveInProject: projectItem.isActive,
        });
      }
    }

    return {
      projectId,
      projectName: project.name,
      projectStatus: project.status,
      projectPriority: project.priority,
      itemsScores: scores.sort((a: any, b: any) => b.totalScore - a.totalScore),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un projet' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: 200, description: 'Projet mis à jour avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  @ApiResponse({
    status: 409,
    description: 'Un projet avec ce nom existe déjà',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un projet' })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiResponse({ status: 204, description: 'Projet supprimé avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Projet non trouvé' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }

  // --- Gestion des items dans les projets ---

  @Post(':id/items')
  @ApiOperation({
    summary: 'Ajouter un item à un projet',
    description:
      'Ajoute un item existant à un projet avec une quantité spécifique',
  })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiBody({ type: AddItemToProjectDto })
  @ApiResponse({
    status: 201,
    description: 'Item ajouté au projet avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Projet ou item non trouvé' })
  @ApiResponse({ status: 409, description: 'Item déjà présent dans le projet' })
  addItemToProject(
    @Param('id', ParseIntPipe) projectId: number,
    @Body() addItemDto: AddItemToProjectDto,
  ) {
    return this.projectsService.addItemToProject(projectId, addItemDto);
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({
    summary: 'Modifier un item dans un projet',
    description: "Modifie la quantité ou l'état actif d'un item dans un projet",
  })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiParam({ name: 'itemId', description: "ID de l'item" })
  @ApiBody({ type: UpdateProjectItemDto })
  @ApiResponse({
    status: 200,
    description: 'Item du projet mis à jour avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({
    status: 404,
    description: 'Projet ou item non trouvé dans le projet',
  })
  updateProjectItem(
    @Param('id', ParseIntPipe) projectId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateDto: UpdateProjectItemDto,
  ) {
    return this.projectsService.updateProjectItem(projectId, itemId, updateDto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Retirer un item d'un projet",
    description: "Retire complètement un item d'un projet",
  })
  @ApiParam({ name: 'id', description: 'ID du projet' })
  @ApiParam({ name: 'itemId', description: "ID de l'item" })
  @ApiResponse({
    status: 204,
    description: 'Item retiré du projet avec succès',
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({
    status: 404,
    description: 'Projet ou item non trouvé dans le projet',
  })
  removeItemFromProject(
    @Param('id', ParseIntPipe) projectId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.projectsService.removeItemFromProject(projectId, itemId);
  }
}

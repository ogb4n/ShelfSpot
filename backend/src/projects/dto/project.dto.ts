import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';
import { ProjectStatus, ProjectPriority } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'Renovation Bureau', description: 'Nom du projet' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Rénovation complète du bureau principal',
    description: 'Description détaillée du projet',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
    description: 'Statut du projet',
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({
    enum: ProjectPriority,
    example: ProjectPriority.HIGH,
    description: 'Priorité du projet',
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiProperty({
    example: '2025-07-01T00:00:00Z',
    description: 'Date de début du projet',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    description: 'Date de fin prévue du projet',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateProjectDto {
  @ApiProperty({
    example: 'Renovation Bureau - Phase 2',
    description: 'Nom du projet',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Rénovation complète du bureau principal - Phase 2',
    description: 'Description détaillée du projet',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ProjectStatus,
    example: ProjectStatus.COMPLETED,
    description: 'Statut du projet',
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({
    enum: ProjectPriority,
    example: ProjectPriority.MEDIUM,
    description: 'Priorité du projet',
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @ApiProperty({
    example: '2025-07-01T00:00:00Z',
    description: 'Date de début du projet',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    description: 'Date de fin prévue du projet',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class AddItemToProjectDto {
  @ApiProperty({ example: 1, description: "ID de l'item à ajouter au projet" })
  @IsInt()
  @Min(1)
  itemId: number;

  @ApiProperty({
    example: 3,
    description: 'Quantité de cet item utilisée dans le projet',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: true,
    description: "Si l'utilisation de cet item est active dans le projet",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProjectItemDto {
  @ApiProperty({
    example: 5,
    description: 'Nouvelle quantité de cet item utilisée dans le projet',
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({
    example: false,
    description: "Si l'utilisation de cet item est active dans le projet",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

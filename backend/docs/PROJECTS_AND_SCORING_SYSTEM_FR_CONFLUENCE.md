# ShelfSpot - Documentation du Système de Projets et de Notation d'Importance

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Schéma de base de données](#schma-de-base-de-donnes)
3. [Algorithme de notation](#algorithme-de-notation)
4. [Points d'accès API](#points-daccs-api)
5. [Détails d'implémentation](#dtails-dimplmentation)
6. [Exemples d'utilisation](#exemples-dutilisation)
7. [Meilleures pratiques](#meilleures-pratiques)
8. [Architecture](#architecture)

## Vue d'ensemble

Le système de projets et de notation ajoute des capacités de gestion de projet à ShelfSpot, permettant aux utilisateurs de suivre quels matériaux et quantités sont utilisés dans les projets. Le système calcule automatiquement un "score d'importance" pour chaque article d'inventaire basé sur son utilisation dans les projets actifs, aidant à prioriser les décisions de gestion d'inventaire.

### Fonctionnalités clés

- **Gestion de projets** : Créer, gérer et suivre les projets avec statut et priorité
- **Suivi des matériaux** : Associer les articles aux projets et suivre les quantités utilisées
- **Notation d'importance** : Calcul automatique de l'importance des articles basé sur l'utilisation dans les projets
- **Analyses intelligentes** : Détection d'articles critiques, articles principaux et insights statistiques
- **Mises à jour en temps réel** : Recalcul automatique des scores lorsque les projets changent

## Schéma de base de données

### Table Project

```sql
CREATE TABLE Project (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  status ProjectStatus NOT NULL DEFAULT 'ACTIVE',
  priority ProjectPriority NOT NULL DEFAULT 'MEDIUM',
  startDate DATETIME,
  endDate DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME
);

CREATE INDEX idx_project_status ON Project(status);
CREATE INDEX idx_project_priority ON Project(priority);
```

### Table de liaison ProjectItem

```sql
CREATE TABLE ProjectItem (
  id SERIAL PRIMARY KEY,
  projectId INT NOT NULL,
  itemId INT NOT NULL,
  quantity FLOAT NOT NULL DEFAULT 1,
  isActive BOOLEAN NOT NULL DEFAULT true,
  addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES Item(id) ON DELETE CASCADE,
  UNIQUE(projectId, itemId)
);

CREATE INDEX idx_project_item_project ON ProjectItem(projectId);
CREATE INDEX idx_project_item_item ON ProjectItem(itemId);
CREATE INDEX idx_project_item_active ON ProjectItem(isActive);
```

### Table Item améliorée

```sql
ALTER TABLE Item ADD COLUMN importanceScore FLOAT DEFAULT 0;
CREATE INDEX idx_item_importance_score ON Item(importanceScore);
```

### Énumérations

```sql
CREATE TYPE ProjectStatus AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED');
CREATE TYPE ProjectPriority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
```

## Algorithme de notation

### Formule

```
Score Total = Score Projets Actifs + Score Projets en Pause + Bonus Multi-Projets

Où :
- Score Projets Actifs = Σ(quantité × multiplicateur_priorité) pour les projets ACTIFS
- Score Projets en Pause = Σ(quantité × multiplicateur_priorité × 0.3) pour les projets EN_PAUSE
- Bonus Multi-Projets = nombre_projets × 0.5 (si utilisé dans plusieurs projets actifs)
```

### Multiplicateurs de priorité

- **CRITIQUE** : ×4.0
- **ÉLEVÉE** : ×2.0
- **MOYENNE** : ×1.0
- **FAIBLE** : ×0.5

### Impact du statut

- **ACTIF** : Contribution complète au score
- **EN_PAUSE** : 30% de contribution au score
- **TERMINÉ** : Aucune contribution au score
- **ANNULÉ** : Aucune contribution au score

### Exemple de calcul

Article utilisé dans :

- Projet A (ACTIF, priorité ÉLEVÉE) : 5 unités → 5 × 2.0 = 10 points
- Projet B (EN_PAUSE, priorité CRITIQUE) : 3 unités → 3 × 4.0 × 0.3 = 3.6 points
- Bonus multi-projets : 2 projets × 0.5 = 1 point

**Score Total : 10 + 3.6 + 1 = 14.6**

## Points d'accès API

### CRUD des projets

#### Créer un projet

```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rénovation cuisine",
  "description": "Projet complet de rénovation de cuisine",
  "status": "ACTIVE",
  "priority": "HIGH",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-03-15T00:00:00Z"
}
```

#### Obtenir tous les projets

```http
GET /projects
Authorization: Bearer <token>
```

#### Obtenir les détails d'un projet

```http
GET /projects/{id}
Authorization: Bearer <token>
```

#### Mettre à jour un projet

```http
PATCH /projects/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "priority": "MEDIUM"
}
```

#### Supprimer un projet

```http
DELETE /projects/{id}
Authorization: Bearer <token>
```

### Gestion des articles de projet

#### Ajouter un article à un projet

```http
POST /projects/{projectId}/items/{itemId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 5.5
}
```

#### Mettre à jour la quantité d'un article dans un projet

```http
PATCH /projects/{projectId}/items/{itemId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 8.0
}
```

#### Supprimer un article d'un projet

```http
DELETE /projects/{projectId}/items/{itemId}
Authorization: Bearer <token>
```

### Analyses de notation

#### Obtenir les statistiques de notation

```http
GET /projects/scoring/statistics
Authorization: Bearer <token>

Réponse :
{
  "totalItems": 150,
  "itemsWithScore": 45,
  "averageScore": 3.25,
  "maxScore": 28.5,
  "distribution": {
    "critical": 5,    // > 10
    "high": 12,       // 5-10
    "medium": 18,     // 1-5
    "low": 10,        // 0.1-1
    "zero": 105       // 0
  }
}
```

#### Obtenir les articles principaux par importance

```http
GET /projects/scoring/top-items
Authorization: Bearer <token>

Réponse :
[
  {
    "id": 123,
    "name": "Vis en bois premium",
    "quantity": 50,
    "importanceScore": 28.5,
    "status": "EN_STOCK",
    "room": { "name": "Atelier" },
    "place": { "name": "Armoire à outils" },
    "container": { "name": "Boîte matériel A" }
  }
]
```

#### Obtenir les articles critiques (Score élevé + Stock faible)

```http
GET /projects/scoring/critical-items
Authorization: Bearer <token>

Réponse :
[
  {
    "id": 456,
    "name": "Charnières spécialisées",
    "quantity": 2,
    "importanceScore": 15.2,
    "status": "STOCK_FAIBLE",
    "criticalityRatio": 7.6,
    "room": { "name": "Stockage" },
    "place": { "name": "Étagère matériel" },
    "container": null
  }
]
```

#### Recalculer tous les scores

```http
POST /projects/scoring/recalculate
Authorization: Bearer <token>

Réponse :
{
  "updated": 145,
  "errors": 0,
  "topItems": [...]
}
```

#### Obtenir les statistiques d'un projet

```http
GET /projects/{id}/statistics
Authorization: Bearer <token>

Réponse :
{
  "project": {
    "id": 1,
    "name": "Rénovation cuisine",
    "status": "ACTIVE",
    "priority": "HIGH"
  },
  "statistics": {
    "totalItems": 15,
    "totalQuantityUsed": 127.5,
    "averageQuantityPerItem": 8.5,
    "highestQuantityItem": {
      "id": 123,
      "name": "Vis en bois",
      "quantity": 25
    },
    "itemsByStatus": {
      "EN_STOCK": 12,
      "STOCK_FAIBLE": 2,
      "HORS_STOCK": 1
    }
  }
}
```

#### Obtenir la répartition de notation d'un projet

```http
GET /projects/{id}/scoring/breakdown
Authorization: Bearer <token>

Réponse :
{
  "project": {
    "id": 1,
    "name": "Rénovation cuisine"
  },
  "itemsScoring": [
    {
      "itemId": 123,
      "itemName": "Vis en bois",
      "totalScore": 15.5,
      "breakdown": {
        "activeProjectsScore": 15.0,
        "pausedProjectsScore": 0,
        "projectCountBonus": 0.5,
        "priorityMultiplier": 2.0
      },
      "projectsUsage": [
        {
          "projectId": 1,
          "projectName": "Rénovation cuisine",
          "status": "ACTIVE",
          "priority": "HIGH",
          "quantityUsed": 7.5,
          "contribution": 15.0
        }
      ]
    }
  ]
}
```

## Détails d'implémentation

### Services principaux

#### ScoringService

Situé dans `src/scoring/scoring.service.ts`

**Méthodes clés :**

- `calculateItemScore(itemId)` : Calculer le score pour un article spécifique
- `calculateAllItemsScores()` : Calcul en lot pour tous les articles
- `recalculateProjectItemsScores(projectId)` : Recalculer les articles affectés lors de changements de projet
- `getTopImportanceItems(limit)` : Obtenir les articles avec les scores les plus élevés
- `getCriticalItems(maxQuantity)` : Obtenir les articles avec des scores élevés mais un stock faible
- `getScorignStatistics()` : Statistiques globales de notation

#### ProjectsService

Situé dans `src/projects/projects.service.ts`

**Méthodes clés :**

- `create(createProjectDto)` : Créer un nouveau projet
- `findAll()` : Obtenir tous les projets avec articles
- `findOne(id)` : Obtenir les détails d'un projet
- `update(id, updateProjectDto)` : Mettre à jour un projet (déclenche le recalcul des scores)
- `remove(id)` : Supprimer un projet
- `addItemToProject(projectId, itemId, dto)` : Ajouter un article à un projet
- `updateProjectItem(projectId, itemId, dto)` : Mettre à jour la quantité d'un article
- `removeItemFromProject(projectId, itemId)` : Supprimer un article d'un projet
- `getProjectStatistics(id)` : Obtenir les analyses d'un projet

### Mises à jour automatiques des scores

Le système déclenche automatiquement le recalcul des scores quand :

1. **Le statut d'un projet change** (ex. ACTIF → EN_PAUSE)
2. **La priorité d'un projet change** (ex. MOYENNE → ÉLEVÉE)
3. **Des articles sont ajoutés aux projets**
4. **Les quantités d'articles sont mises à jour dans les projets**
5. **Des articles sont supprimés des projets**
6. **Des projets sont supprimés**

```typescript
// Exemple : Déclencheur de recalcul automatique
async update(id: number, updateProjectDto: UpdateProjectDto) {
  const project = await this.prisma.project.update({
    where: { id },
    data: updateProjectDto,
  });

  // Déclencher le recalcul des scores si le statut ou la priorité a changé
  if (updateProjectDto.status !== undefined || updateProjectDto.priority !== undefined) {
    this.scoringService.recalculateProjectItemsScores(id);
  }

  return project;
}
```

### Objets de transfert de données (DTOs)

Situés dans `src/projects/dto/project.dto.ts`

```typescript
export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class AddItemToProjectDto {
  @IsPositive()
  @IsNumber()
  quantity: number;
}
```

## Exemples d'utilisation

### Flux de travail de projet de base

```typescript
// 1. Créer un nouveau projet
const project = await projectsService.create({
  name: 'Rénovation salle de bain',
  description: 'Rénovation complète de salle de bain',
  status: ProjectStatus.ACTIVE,
  priority: ProjectPriority.HIGH,
  startDate: '2024-01-15T00:00:00Z',
});

// 2. Ajouter des articles au projet
await projectsService.addItemToProject(project.id, 123, { quantity: 10 }); // Carreaux
await projectsService.addItemToProject(project.id, 456, { quantity: 2 }); // Robinets
await projectsService.addItemToProject(project.id, 789, { quantity: 5 }); // Tuyaux

// 3. Vérifier les scores d'importance des articles (mis à jour automatiquement)
const topItems = await scoringService.getTopImportanceItems(10);
console.log('Articles les plus importants:', topItems);

// 4. Mettre à jour le statut du projet
await projectsService.update(project.id, {
  status: ProjectStatus.COMPLETED,
});
// Les scores sont automatiquement recalculés pour tous les articles du projet
```

### Surveillance des articles critiques

```typescript
// Obtenir les articles nécessitant une attention immédiate
const criticalItems = await scoringService.getCriticalItems(5);

// Ces articles ont une importance élevée mais un stock faible
criticalItems.forEach((item) => {
  console.log(`⚠️ CRITIQUE: ${item.name}`);
  console.log(`   Stock: ${item.quantity} unités`);
  console.log(`   Importance: ${item.importanceScore}`);
  console.log(`   Ratio de criticité: ${item.criticalityRatio}`);
});
```

### Analyses et rapports

```typescript
// Obtenir les statistiques globales de notation
const stats = await scoringService.getScorignStatistics();
console.log(`Total d'articles: ${stats.totalItems}`);
console.log(`Articles avec projets: ${stats.itemsWithScore}`);
console.log(`Importance moyenne: ${stats.averageScore}`);

// Obtenir les analyses spécifiques à un projet
const projectStats = await projectsService.getProjectStatistics(projectId);
console.log(`Le projet a ${projectStats.statistics.totalItems} articles`);
console.log(
  `Quantité totale utilisée: ${projectStats.statistics.totalQuantityUsed}`,
);
```

## Meilleures pratiques

### Gestion de projets

1. **Définir des priorités réalistes** : Utiliser CRITIQUE avec parcimonie pour les projets vraiment urgents
2. **Mises à jour régulières du statut** : Maintenir le statut des projets à jour pour des scores précis
3. **Précision des quantités** : S'assurer que les quantités d'articles dans les projets reflètent l'utilisation réelle
4. **Nettoyage des projets terminés** : Archiver ou nettoyer périodiquement les anciens projets terminés

### Optimisation de la notation

1. **Recalcul régulier** : Exécuter un recalcul complet des scores hebdomadairement ou après des changements majeurs
2. **Surveiller les articles critiques** : Vérifier quotidiennement les articles critiques pour les besoins de réapprovisionnement
3. **Utiliser les analyses** : Exploiter les points d'accès de statistiques pour des insights d'inventaire
4. **Considérations de performance** : Le système utilise des index de base de données pour une performance optimale

### Utilisation de l'API

1. **Authentification** : Tous les points d'accès nécessitent une authentification JWT
2. **Gestion d'erreurs** : Implémenter une gestion d'erreurs appropriée pour tous les appels API
3. **Pagination** : Pour les grands ensembles de données, considérer l'ajout de pagination aux points d'accès de liste
4. **Mise en cache** : Considérer la mise en cache des résultats de notation pour les données fréquemment consultées

## Architecture

### Structure des modules

```
src/
├── scoring/
│   ├── scoring.service.ts      # Algorithme de notation principal
│   └── scoring.module.ts       # Module de notation
├── projects/
│   ├── projects.service.ts     # Logique métier des projets
│   ├── projects.controller.ts  # Points d'accès API REST
│   ├── projects.module.ts      # Module de projets
│   └── dto/
│       └── project.dto.ts      # Objets de transfert de données
└── items/
    ├── items.service.ts        # Amélioré avec intégration de notation
    └── items.module.ts         # Importe ScoringModule
```

### Relations de base de données

```
Item 1 ←→ M ProjectItem M ←→ 1 Project
     ↑                           ↑
     └─ importanceScore          └─ status, priority
```

### Dépendances des services

```
ProjectsController
    ├── ProjectsService
    │   ├── PrismaService
    │   └── ScoringService ← (pour recalcul automatique)
    └── ScoringService ← (pour points d'accès d'analyses)

ItemsService
    ├── PrismaService
    └── ScoringService ← (pour intégration des scores)
```

### Flux de données

1. **Changements de projet** → Déclencher le recalcul automatique des scores
2. **Calcul des scores** → Mettre à jour Item.importanceScore dans la base de données
3. **Requêtes API** → Retourner les articles triés par score d'importance
4. **Analyses** → Agréger les données de notation pour des insights

### Considérations de performance

- **Index de base de données** : Ajoutés sur projectId, itemId, isActive, importanceScore
- **Opérations asynchrones** : Le recalcul des scores s'exécute de manière asynchrone
- **Requêtes efficaces** : Utilise les fonctions include/select de Prisma pour une récupération de données optimisée
- **Opérations en lot** : Mises à jour de scores par lots pour de meilleures performances

---

Ce système fournit une solution complète pour la gestion d'inventaire basée sur les projets avec notation d'importance intelligente, permettant une meilleure prise de décision pour les achats, le réapprovisionnement et la priorisation d'inventaire dans ShelfSpot.

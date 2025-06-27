# ShelfSpot - Projects and Scoring System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Scoring Algorithm](#scoring-algorithm)
4. [API Endpoints](#api-endpoints)
5. [Implementation Details](#implementation-details)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)
8. [Architecture](#architecture)

## Overview

The Projects and Scoring System adds project management capabilities to ShelfSpot, enabling users to track which materials and quantities are used in projects. The system automatically calculates an "importance score" for each inventory item based on its usage across active projects, helping prioritize inventory management decisions.

### Key Features

- **Project Management**: Create, manage, and track projects with status and priority
- **Material Tracking**: Associate items with projects and track quantities used
- **Importance Scoring**: Automatic calculation of item importance based on project usage
- **Smart Analytics**: Critical items detection, top items, and statistical insights
- **Real-time Updates**: Automatic score recalculation when projects change

## Database Schema

### Project Table

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

### ProjectItem Junction Table

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

### Enhanced Item Table

```sql
ALTER TABLE Item ADD COLUMN importanceScore FLOAT DEFAULT 0;
CREATE INDEX idx_item_importance_score ON Item(importanceScore);
```

### Enums

```sql
CREATE TYPE ProjectStatus AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED');
CREATE TYPE ProjectPriority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
```

## Scoring Algorithm

### Formula

```
Total Score = Active Projects Score + Paused Projects Score + Multi-Project Bonus

Where:
- Active Projects Score = Σ(quantity × priority_multiplier) for ACTIVE projects
- Paused Projects Score = Σ(quantity × priority_multiplier × 0.3) for PAUSED projects
- Multi-Project Bonus = project_count × 0.5 (if used in multiple active projects)
```

### Priority Multipliers

- **CRITICAL**: ×4.0
- **HIGH**: ×2.0
- **MEDIUM**: ×1.0
- **LOW**: ×0.5

### Status Impact

- **ACTIVE**: Full score contribution
- **PAUSED**: 30% score contribution
- **COMPLETED**: No score contribution
- **CANCELLED**: No score contribution

### Example Calculation

Item used in:

- Project A (ACTIVE, HIGH priority): 5 units → 5 × 2.0 = 10 points
- Project B (PAUSED, CRITICAL priority): 3 units → 3 × 4.0 × 0.3 = 3.6 points
- Multi-project bonus: 2 projects × 0.5 = 1 point

**Total Score: 10 + 3.6 + 1 = 14.6**

## API Endpoints

### Projects CRUD

#### Create Project

```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Kitchen Renovation",
  "description": "Complete kitchen makeover project",
  "status": "ACTIVE",
  "priority": "HIGH",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-03-15T00:00:00Z"
}
```

#### Get All Projects

```http
GET /projects
Authorization: Bearer <token>
```

#### Get Project Details

```http
GET /projects/{id}
Authorization: Bearer <token>
```

#### Update Project

```http
PATCH /projects/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "priority": "MEDIUM"
}
```

#### Delete Project

```http
DELETE /projects/{id}
Authorization: Bearer <token>
```

### Project Items Management

#### Add Item to Project

```http
POST /projects/{projectId}/items/{itemId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 5.5
}
```

#### Update Item Quantity in Project

```http
PATCH /projects/{projectId}/items/{itemId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 8.0
}
```

#### Remove Item from Project

```http
DELETE /projects/{projectId}/items/{itemId}
Authorization: Bearer <token>
```

### Scoring Analytics

#### Get Scoring Statistics

```http
GET /projects/scoring/statistics
Authorization: Bearer <token>

Response:
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

#### Get Top Items by Importance

```http
GET /projects/scoring/top-items
Authorization: Bearer <token>

Response:
[
  {
    "id": 123,
    "name": "Premium Wood Screws",
    "quantity": 50,
    "importanceScore": 28.5,
    "status": "IN_STOCK",
    "room": { "name": "Workshop" },
    "place": { "name": "Tool Cabinet" },
    "container": { "name": "Hardware Box A" }
  }
]
```

#### Get Critical Items (High Score + Low Stock)

```http
GET /projects/scoring/critical-items
Authorization: Bearer <token>

Response:
[
  {
    "id": 456,
    "name": "Specialty Hinges",
    "quantity": 2,
    "importanceScore": 15.2,
    "status": "LOW_STOCK",
    "criticalityRatio": 7.6,
    "room": { "name": "Storage" },
    "place": { "name": "Hardware Shelf" },
    "container": null
  }
]
```

#### Recalculate All Scores

```http
POST /projects/scoring/recalculate
Authorization: Bearer <token>

Response:
{
  "updated": 145,
  "errors": 0,
  "topItems": [...]
}
```

#### Get Project Statistics

```http
GET /projects/{id}/statistics
Authorization: Bearer <token>

Response:
{
  "project": {
    "id": 1,
    "name": "Kitchen Renovation",
    "status": "ACTIVE",
    "priority": "HIGH"
  },
  "statistics": {
    "totalItems": 15,
    "totalQuantityUsed": 127.5,
    "averageQuantityPerItem": 8.5,
    "highestQuantityItem": {
      "id": 123,
      "name": "Wood Screws",
      "quantity": 25
    },
    "itemsByStatus": {
      "IN_STOCK": 12,
      "LOW_STOCK": 2,
      "OUT_OF_STOCK": 1
    }
  }
}
```

#### Get Project Scoring Breakdown

```http
GET /projects/{id}/scoring/breakdown
Authorization: Bearer <token>

Response:
{
  "project": {
    "id": 1,
    "name": "Kitchen Renovation"
  },
  "itemsScoring": [
    {
      "itemId": 123,
      "itemName": "Wood Screws",
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
          "projectName": "Kitchen Renovation",
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

## Implementation Details

### Core Services

#### ScoringService

Located in `src/scoring/scoring.service.ts`

**Key Methods:**

- `calculateItemScore(itemId)`: Calculate score for a specific item
- `calculateAllItemsScores()`: Bulk calculation for all items
- `recalculateProjectItemsScores(projectId)`: Recalculate affected items when project changes
- `getTopImportanceItems(limit)`: Get highest scoring items
- `getCriticalItems(maxQuantity)`: Get items with high scores but low stock
- `getScorignStatistics()`: Global scoring statistics

#### ProjectsService

Located in `src/projects/projects.service.ts`

**Key Methods:**

- `create(createProjectDto)`: Create new project
- `findAll()`: Get all projects with items
- `findOne(id)`: Get project details
- `update(id, updateProjectDto)`: Update project (triggers score recalculation)
- `remove(id)`: Delete project
- `addItemToProject(projectId, itemId, dto)`: Add item to project
- `updateProjectItem(projectId, itemId, dto)`: Update item quantity
- `removeItemFromProject(projectId, itemId)`: Remove item from project
- `getProjectStatistics(id)`: Get project analytics

### Automatic Score Updates

The system automatically triggers score recalculation when:

1. **Project status changes** (e.g., ACTIVE → PAUSED)
2. **Project priority changes** (e.g., MEDIUM → HIGH)
3. **Items are added to projects**
4. **Item quantities are updated in projects**
5. **Items are removed from projects**
6. **Projects are deleted**

```typescript
// Example: Automatic recalculation trigger
async update(id: number, updateProjectDto: UpdateProjectDto) {
  const project = await this.prisma.project.update({
    where: { id },
    data: updateProjectDto,
  });

  // Trigger score recalculation if status or priority changed
  if (updateProjectDto.status !== undefined || updateProjectDto.priority !== undefined) {
    this.scoringService.recalculateProjectItemsScores(id);
  }

  return project;
}
```

### Data Transfer Objects (DTOs)

Located in `src/projects/dto/project.dto.ts`

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

## Usage Examples

### Basic Project Workflow

```typescript
// 1. Create a new project
const project = await projectsService.create({
  name: 'Bathroom Renovation',
  description: 'Complete bathroom makeover',
  status: ProjectStatus.ACTIVE,
  priority: ProjectPriority.HIGH,
  startDate: '2024-01-15T00:00:00Z',
});

// 2. Add items to the project
await projectsService.addItemToProject(project.id, 123, { quantity: 10 }); // Tiles
await projectsService.addItemToProject(project.id, 456, { quantity: 2 }); // Faucets
await projectsService.addItemToProject(project.id, 789, { quantity: 5 }); // Pipes

// 3. Check item importance scores (automatically updated)
const topItems = await scoringService.getTopImportanceItems(10);
console.log('Top important items:', topItems);

// 4. Update project status
await projectsService.update(project.id, {
  status: ProjectStatus.COMPLETED,
});
// Scores are automatically recalculated for all project items
```

### Monitoring Critical Items

```typescript
// Get items that need immediate attention
const criticalItems = await scoringService.getCriticalItems(5);

// These items have high importance but low stock
criticalItems.forEach((item) => {
  console.log(`⚠️ CRITICAL: ${item.name}`);
  console.log(`   Stock: ${item.quantity} units`);
  console.log(`   Importance: ${item.importanceScore}`);
  console.log(`   Criticality Ratio: ${item.criticalityRatio}`);
});
```

### Analytics and Reporting

```typescript
// Get overall scoring statistics
const stats = await scoringService.getScorignStatistics();
console.log(`Total items: ${stats.totalItems}`);
console.log(`Items with projects: ${stats.itemsWithScore}`);
console.log(`Average importance: ${stats.averageScore}`);

// Get project-specific analytics
const projectStats = await projectsService.getProjectStatistics(projectId);
console.log(`Project has ${projectStats.statistics.totalItems} items`);
console.log(
  `Total quantity used: ${projectStats.statistics.totalQuantityUsed}`,
);
```

## Best Practices

### Project Management

1. **Set Realistic Priorities**: Use CRITICAL sparingly for truly urgent projects
2. **Regular Status Updates**: Keep project status current to maintain accurate scores
3. **Quantity Accuracy**: Ensure item quantities in projects reflect actual usage
4. **Clean Up Completed Projects**: Archive or clean up old completed projects periodically

### Scoring Optimization

1. **Regular Recalculation**: Run full score recalculation weekly or after major changes
2. **Monitor Critical Items**: Check critical items daily for restocking needs
3. **Use Analytics**: Leverage the statistics endpoints for inventory insights
4. **Performance Considerations**: The system uses database indexes for optimal performance

### API Usage

1. **Authentication**: All endpoints require JWT authentication
2. **Error Handling**: Implement proper error handling for all API calls
3. **Pagination**: For large datasets, consider adding pagination to list endpoints
4. **Caching**: Consider caching scoring results for frequently accessed data

## Architecture

### Module Structure

```
src/
├── scoring/
│   ├── scoring.service.ts      # Core scoring algorithm
│   └── scoring.module.ts       # Scoring module
├── projects/
│   ├── projects.service.ts     # Projects business logic
│   ├── projects.controller.ts  # REST API endpoints
│   ├── projects.module.ts      # Projects module
│   └── dto/
│       └── project.dto.ts      # Data transfer objects
└── items/
    ├── items.service.ts        # Enhanced with scoring integration
    └── items.module.ts         # Imports ScoringModule
```

### Database Relationships

```
Item 1 ←→ M ProjectItem M ←→ 1 Project
     ↑                           ↑
     └─ importanceScore          └─ status, priority
```

### Service Dependencies

```
ProjectsController
    ├── ProjectsService
    │   ├── PrismaService
    │   └── ScoringService ← (for auto-recalculation)
    └── ScoringService ← (for analytics endpoints)

ItemsService
    ├── PrismaService
    └── ScoringService ← (for score integration)
```

### Data Flow

1. **Project Changes** → Trigger automatic score recalculation
2. **Score Calculation** → Update Item.importanceScore in database
3. **API Queries** → Return items sorted by importance score
4. **Analytics** → Aggregate scoring data for insights

### Performance Considerations

- **Database Indexes**: Added on projectId, itemId, isActive, importanceScore
- **Async Operations**: Score recalculation runs asynchronously
- **Efficient Queries**: Uses Prisma's include/select for optimized data fetching
- **Bulk Operations**: Batch score updates for better performance

---

This system provides a comprehensive solution for project-based inventory management with intelligent importance scoring, enabling better decision-making for purchasing, restocking, and inventory prioritization in ShelfSpot.

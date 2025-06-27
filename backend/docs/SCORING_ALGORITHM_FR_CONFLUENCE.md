# Algorithme de Notation d'Importance - ShelfSpot

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Formule de calcul](#formule-de-calcul)
3. [Composants du score](#composants-du-score)
4. [Déclencheurs automatiques](#dclencheurs-automatiques)
5. [API et points d'accès](#api-et-points-daccs)
6. [Exemples pratiques](#exemples-pratiques)
7. [Architecture technique](#architecture-technique)
8. [Cas d'usage](#cas-dusage)

---

## Vue d'ensemble

Le **système de notation d'importance** de ShelfSpot permet de calculer automatiquement un score numérique pour chaque article de l'inventaire en fonction de son utilisation dans les projets actifs. Ce score aide à :

- **Prioriser les commandes** : Les articles avec un score élevé sont plus critiques
- **Optimiser la gestion du stock** : Focus sur les articles les plus importants
- **Anticiper les besoins** : Identifier les articles critiques avant rupture de stock
- **Analyser l'impact** : Comprendre quels articles bloquent le plus de projets

---

## Formule de calcul

### Formule générale

```
Score Total = Score Projets Actifs + Score Projets en Pause + Bonus Multi-projets
```

### Détail des composants

```typescript
Score Projets Actifs = Σ(quantité_utilisée × multiplicateur_priorité)
Score Projets en Pause = Σ(quantité_utilisée × multiplicateur_priorité × 0.3)
Bonus Multi-projets = nombre_projets_actifs > 1 ? nombre_projets_actifs × 0.5 : 0
```

### Multiplicateurs de priorité

| Priorité   | Multiplicateur | Impact                            |
| ---------- | -------------- | --------------------------------- |
| `CRITIQUE` | ×4.0           | Très critique, priorité absolue   |
| `ÉLEVÉE`   | ×2.0           | Haute priorité                    |
| `MOYENNE`  | ×1.0           | Priorité normale (valeur de base) |
| `FAIBLE`   | ×0.5           | Basse priorité                    |

---

## Composants du score

### 1. Score des projets actifs (100% du poids)

- **Statuts considérés** : `ACTIF`
- **Calcul** : `quantité × multiplicateur_priorité`
- **Justification** : Les projets actifs ont un impact immédiat sur les besoins

### 2. Score des projets en pause (30% du poids)

- **Statuts considérés** : `EN_PAUSE`
- **Calcul** : `quantité × multiplicateur_priorité × 0.3`
- **Justification** : Les projets en pause peuvent reprendre, mais avec moins d'urgence

### 3. Bonus multi-projets

- **Calcul** : `nombre_projets_actifs > 1 ? nombre_projets_actifs × 0.5 : 0`
- **Justification** : Un article utilisé dans plusieurs projets est plus critique (diversification du risque)

### 4. Projets ignorés

- **Statuts ignorés** : `TERMINÉ`, `ANNULÉ`
- **Justification** : Ces projets n'ont plus d'impact sur les besoins futurs

---

## Déclencheurs automatiques

### Recalcul automatique en temps réel

| Action                        | Moment             | Articles affectés           | Méthode                                    |
| ----------------------------- | ------------------ | --------------------------- | ------------------------------------------ |
| **Créer un projet**           | Après création     | Aucun (projet vide)         | -                                          |
| **Modifier statut projet**    | Immédiatement      | Tous les articles du projet | `recalculateProjectItemsScores()`          |
| **Modifier priorité projet**  | Immédiatement      | Tous les articles du projet | `recalculateProjectItemsScores()`          |
| **Ajouter article au projet** | Après ajout        | L'article ajouté            | `calculateItemScore()`                     |
| **Modifier quantité article** | Après modification | L'article modifié           | `calculateItemScore()`                     |
| **Retirer article du projet** | Après suppression  | L'article retiré            | `calculateItemScore()`                     |
| **Supprimer projet**          | Après suppression  | Tous les articles du projet | `calculateItemScore()` pour chaque article |

### Code des déclencheurs

```typescript
// Dans ProjectsService
if (
  updateProjectDto.status !== undefined ||
  updateProjectDto.priority !== undefined
) {
  this.scoringService.recalculateProjectItemsScores(id).catch(console.error);
}

// Après modification d'article dans projet
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
```

---

## API et points d'accès

### Points d'accès de gestion des projets

```bash
# Gestion des projets
POST   /projects                    # Créer un projet
GET    /projects                    # Lister tous les projets
GET    /projects/:id                # Détails d'un projet
PATCH  /projects/:id                # Modifier un projet (recalcul auto)
DELETE /projects/:id                # Supprimer un projet (recalcul auto)

# Gestion des articles dans les projets
POST   /projects/:id/items          # Ajouter un article (recalcul auto)
PATCH  /projects/:id/items/:itemId  # Modifier quantité (recalcul auto)
DELETE /projects/:id/items/:itemId  # Retirer un article (recalcul auto)
```

### Points d'accès de notation et statistiques

```bash
# Recalcul et statistiques
POST /projects/scoring/recalculate     # Recalcul complet de tous les scores
GET  /projects/scoring/statistics      # Statistiques globales des scores
GET  /projects/scoring/top-items       # Top 20 des articles les plus importants
GET  /projects/scoring/critical-items  # Articles critiques (score élevé + stock faible)

# Analyse par projet
GET /projects/:id/statistics           # Statistiques d'un projet
GET /projects/:id/scoring/breakdown    # Détail des scores des articles du projet
```

### Réponses types

```typescript
// GET /projects/scoring/top-items
{
  "id": 42,
  "name": "Perceuse électrique",
  "quantity": 3,
  "importanceScore": 12.5,
  "status": "disponible",
  "room": { "name": "Atelier" },
  "place": { "name": "Étagère principale" }
}

// GET /projects/scoring/critical-items
{
  "id": 15,
  "name": "Vis inox M6",
  "quantity": 2,                    // Stock faible
  "importanceScore": 8.0,           // Score élevé
  "criticalityRatio": 4.0,          // 8.0 / 2 = très critique
  "status": "disponible"
}
```

---

## Exemples pratiques

### Exemple 1 : Article dans un seul projet

```
Article : "Marteau"
Projet A (ACTIF, priorité ÉLEVÉE) : 1 unité

Calcul :
- Score projets actifs = 1 × 2.0 = 2.0
- Score projets en pause = 0
- Bonus multi-projets = 0 (un seul projet)
- Score total = 2.0
```

### Exemple 2 : Article dans plusieurs projets

```
Article : "Perceuse"
Projet A (ACTIF, priorité CRITIQUE) : 2 unités
Projet B (ACTIF, priorité MOYENNE) : 1 unité
Projet C (EN_PAUSE, priorité ÉLEVÉE) : 3 unités

Calcul :
- Score projets actifs = (2 × 4.0) + (1 × 1.0) = 9.0
- Score projets en pause = (3 × 2.0 × 0.3) = 1.8
- Bonus multi-projets = 2 projets actifs × 0.5 = 1.0
- Score total = 9.0 + 1.8 + 1.0 = 11.8
```

### Exemple 3 : Évolution du score

```
État initial :
Article "Scie" dans Projet A (ACTIF, ÉLEVÉE) : 1 unité
Score = 1 × 2.0 = 2.0

Action : Changement de priorité Projet A → CRITIQUE
Nouveau score = 1 × 4.0 = 4.0 (recalculé automatiquement)

Action : Ajout dans Projet B (ACTIF, MOYENNE) : 2 unités
Nouveau score = (1 × 4.0) + (2 × 1.0) + (2 × 0.5) = 7.0
```

---

## Architecture technique

### Services impliqués

#### ScoringService (`src/scoring/scoring.service.ts`)

- **Responsabilité** : Calculs de scores et statistiques
- **Méthodes principales** :
  - `calculateItemScore(itemId)` : Calcul pour un article
  - `calculateAllItemsScores()` : Recalcul complet
  - `recalculateProjectItemsScores(projectId)` : Recalcul d'un projet
  - `getTopImportanceItems()` : Top des articles importants
  - `getCriticalItems()` : Articles critiques

#### ProjectsService (`src/projects/projects.service.ts`)

- **Responsabilité** : Gestion des projets et déclenchement des recalculs
- **Intégration** : Appelle `ScoringService` automatiquement

#### ItemsService (`src/items/items.service.ts`)

- **Responsabilité** : Gestion des articles
- **Intégration** : Peut utiliser `ScoringService` pour le tri

### Base de données

#### Table `Project`

```sql
id          INT PRIMARY KEY
name        VARCHAR UNIQUE
description TEXT
status      ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED')
priority    ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
startDate   DATETIME
endDate     DATETIME
createdAt   DATETIME
updatedAt   DATETIME
```

#### Table `ProjectItem` (table de liaison)

```sql
id         INT PRIMARY KEY
projectId  INT FOREIGN KEY
itemId     INT FOREIGN KEY
quantity   INT DEFAULT 1
isActive   BOOLEAN DEFAULT TRUE
createdAt  DATETIME
updatedAt  DATETIME

UNIQUE KEY (projectId, itemId)
```

#### Table `Item` (propriété ajoutée)

```sql
-- Propriété ajoutée
importanceScore FLOAT DEFAULT 0

-- Index pour optimiser les tris
INDEX idx_importance_score (importanceScore)
```

### Flux de données

```
Action sur projet → ProjectsService → ScoringService.calculateItemScore →
Calcul du score → Mise à jour item.importanceScore → Score disponible pour tri
```

---

## Cas d'usage

### 1. Priorisation des commandes

```typescript
// Obtenir les articles les plus critiques à recommander
const criticalItems = await scoringService.getCriticalItems(5);
// Retourne les articles avec score élevé mais stock ≤ 5
```

### 2. Tableau de bord de gestion

```typescript
// Statistiques globales pour le tableau de bord admin
const stats = await scoringService.getScorignStatistics();
/*
{
  totalItems: 150,
  itemsWithScore: 45,
  averageScore: 3.2,
  maxScore: 15.8,
  distribution: {
    critical: 5,  // Score > 10
    high: 12,     // Score 5-10
    medium: 20,   // Score 1-5
    low: 8,       // Score 0.1-1
    zero: 105     // Score = 0
  }
}
*/
```

### 3. Analyse d'impact de projet

```typescript
// Voir l'impact d'un projet sur les scores
const breakdown =
  await projectsController.getProjectScoringBreakdown(projectId);
// Retourne le détail des scores de tous les articles du projet
```

### 4. Tri intelligent des articles

```typescript
// Option A : Points d'accès dédiés (recommandé)
const topItems = await scoringService.getTopImportanceItems(20);

// Option B : Modifier ItemsService pour tri par défaut
async findAll() {
  return this.prisma.item.findMany({
    orderBy: { importanceScore: 'desc' }, // Tri par importance
    include: { /* ... */ }
  });
}
```

### 5. Alertes intelligentes

```typescript
// Combiner alertes stock + score d'importance
const alertsWithPriority = alerts.map((alert) => ({
  ...alert,
  priority: alert.item.importanceScore > 10 ? 'CRITIQUE' : 'NORMAL',
}));
```

### Surveillance

- Log des recalculs de scores
- Métriques de performance des calculs
- Alertes si recalcul prend trop de temps

---

### Fonctionnalités

- **Suggestions automatiques** : "Articles à commander en priorité"
- **Prédictions** : "Stock épuisé dans X jours selon les projets"
- **Optimisation** : "Réorganiser les articles par importance"
- **Rapports** : Export Excel des analyses de criticité

---

## Références techniques

### Fichiers sources

- `src/scoring/scoring.service.ts` - Logique de calcul
- `src/projects/projects.service.ts` - Déclencheurs automatiques
- `src/projects/projects.controller.ts` - Points d'accès API
- `prisma/schema.prisma` - Modèle de données
- `src/projects/dto/project.dto.ts` - Types et validation

### Dépendances

- Prisma ORM pour l'accès aux données
- NestJS pour l'architecture modulaire
- class-validator pour la validation des DTOs
- Swagger pour la documentation API

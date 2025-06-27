# Système de Projets et Notation d'Importance - ShelfSpot

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Comment ça fonctionne](#comment-ça-fonctionne)
3. [Schéma de base de données](#schma-de-base-de-donnes)
4. [Algorithme de calcul](#algorithme-de-calcul)
5. [Routes API](#routes-api)
6. [Exemples d'utilisation](#exemples-dutilisation)

---

## Vue d'ensemble

Le système de projets et notation d'importance permet de :

- **Créer et gérer des projets** avec statut et priorité
- **Associer des articles aux projets** avec les quantités utilisées
- **Calculer automatiquement un score d'importance** pour chaque article basé sur son utilisation dans les projets
- **Identifier les articles critiques** (score élevé + stock faible)
- **Obtenir des statistiques** sur l'utilisation des articles

Le score d'importance aide à prioriser les achats, le réapprovisionnement et la gestion du stock.

---

## Comment ça fonctionne

### Principe de base

1. **Vous créez des projets** avec un statut (ACTIVE, PAUSED, COMPLETED, CANCELLED) et une priorité (LOW, MEDIUM, HIGH, CRITICAL)
2. **Vous ajoutez des articles aux projets** en spécifiant les quantités nécessaires
3. **Le système calcule automatiquement** un score d'importance pour chaque article
4. **Le score se met à jour en temps réel** quand vous modifiez les projets

### Mise à jour automatique des scores

Le recalcul se déclenche automatiquement quand :

- Vous changez le statut d'un projet (ex: ACTIVE → PAUSED)
- Vous changez la priorité d'un projet (ex: MEDIUM → HIGH)
- Vous ajoutez/supprimez un article dans un projet
- Vous modifiez la quantité d'un article dans un projet
- Vous supprimez un projet

### Utilisation des scores

- **Articles triés par importance** : Focus sur les plus critiques
- **Alertes intelligentes** : Prioriser les articles importants en rupture
- **Décisions d'achat** : Acheter en priorité les articles avec score élevé
- **Statistiques** : Comprendre la répartition de l'importance

---

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
```

### Table ProjectItem (liaison)

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
```

### Table Item (champ ajouté)

```sql
ALTER TABLE Item ADD COLUMN importanceScore FLOAT DEFAULT 0;
```

### Énumérations

```sql
CREATE TYPE ProjectStatus AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED');
CREATE TYPE ProjectPriority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
```

---

## Algorithme de calcul

### Formule générale

```
Score Total = Score Projets Actifs + Score Projets en Pause + Bonus Multi-projets
```

### Détail du calcul

```typescript
// Pour chaque article :
Score Projets Actifs = Σ(quantité × multiplicateur_priorité) pour projets ACTIVE
Score Projets en Pause = Σ(quantité × multiplicateur_priorité × 0.3) pour projets PAUSED
Bonus Multi-projets = si utilisé dans 2+ projets actifs : nombre_projets × 0.5

Score Final = Score Projets Actifs + Score Projets en Pause + Bonus Multi-projets
```

### Multiplicateurs de priorité

| Priorité | Multiplicateur |
| -------- | -------------- |
| CRITICAL | ×4.0           |
| HIGH     | ×2.0           |
| MEDIUM   | ×1.0           |
| LOW      | ×0.5           |

### Impact du statut

- **ACTIVE** : 100% du score (impact immédiat)
- **PAUSED** : 30% du score (peut reprendre)
- **COMPLETED** : 0% (projet fini)
- **CANCELLED** : 0% (projet annulé)

### Exemple concret

```
Article "Perceuse" utilisé dans :
- Projet A (ACTIVE, HIGH) : 2 unités → 2 × 2.0 = 4.0 points
- Projet B (PAUSED, CRITICAL) : 1 unité → 1 × 4.0 × 0.3 = 1.2 points
- Bonus multi-projets : 2 projets × 0.5 = 1.0 point

Score total = 4.0 + 1.2 + 1.0 = 6.2
```

---

## Routes API

### Gestion des projets

#### Créer un projet

```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Rénovation cuisine",
  "description": "Projet de rénovation complète",
  "status": "ACTIVE",
  "priority": "HIGH",
  "startDate": "2024-01-15T00:00:00Z"
}
```

#### Lister tous les projets

```http
GET /projects
Authorization: Bearer <token>
```

#### Obtenir un projet

```http
GET /projects/{id}
Authorization: Bearer <token>
```

#### Modifier un projet

```http
PATCH /projects/{id}
Authorization: Bearer <token>

{
  "status": "COMPLETED",
  "priority": "MEDIUM"
}
```

⚠️ **Déclenche le recalcul automatique des scores**

#### Supprimer un projet

```http
DELETE /projects/{id}
Authorization: Bearer <token>
```

### Gestion des articles dans les projets

#### Ajouter un article au projet

```http
POST /projects/{projectId}/items/{itemId}
Authorization: Bearer <token>

{
  "quantity": 5.5
}
```

⚠️ **Déclenche le recalcul du score de l'article**

#### Modifier la quantité

```http
PATCH /projects/{projectId}/items/{itemId}
Authorization: Bearer <token>

{
  "quantity": 8.0
}
```

⚠️ **Déclenche le recalcul du score de l'article**

#### Retirer un article du projet

```http
DELETE /projects/{projectId}/items/{itemId}
Authorization: Bearer <token>
```

⚠️ **Déclenche le recalcul du score de l'article**

### Consultation des scores et statistiques

#### Statistiques globales des scores

```http
GET /projects/scoring/statistics
Authorization: Bearer <token>
```

**Réponse :**

```json
{
  "totalItems": 150,
  "itemsWithScore": 45,
  "averageScore": 3.25,
  "maxScore": 28.5,
  "distribution": {
    "critical": 5, // Score > 10
    "high": 12, // Score 5-10
    "medium": 18, // Score 1-5
    "low": 10, // Score 0.1-1
    "zero": 105 // Score = 0
  }
}
```

#### Top des articles les plus importants

```http
GET /projects/scoring/top-items
Authorization: Bearer <token>
```

**Réponse :**

```json
[
  {
    "id": 123,
    "name": "Vis en bois premium",
    "quantity": 50,
    "importanceScore": 28.5,
    "status": "EN_STOCK",
    "room": { "name": "Atelier" },
    "place": { "name": "Armoire à outils" }
  }
]
```

#### Articles critiques (score élevé + stock faible)

```http
GET /projects/scoring/critical-items
Authorization: Bearer <token>
```

**Réponse :**

```json
[
  {
    "id": 456,
    "name": "Charnières spécialisées",
    "quantity": 2, // Stock faible
    "importanceScore": 15.2, // Score élevé
    "criticalityRatio": 7.6, // 15.2 / 2
    "status": "STOCK_FAIBLE"
  }
]
```

#### Recalculer tous les scores manuellement

```http
POST /projects/scoring/recalculate
Authorization: Bearer <token>
```

**Réponse :**

```json
{
  "updated": 145,
  "errors": 0,
  "topItems": [...]
}
```

#### Statistiques d'un projet spécifique

```http
GET /projects/{id}/statistics
Authorization: Bearer <token>
```

**Réponse :**

```json
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
    }
  }
}
```

#### Détail des scores pour un projet

```http
GET /projects/{id}/scoring/breakdown
Authorization: Bearer <token>
```

**Réponse :**

```json
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

---

## Exemples d'utilisation

### Scénario complet : Créer un projet et suivre les scores

#### 1. Créer le projet

```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rénovation salle de bain",
    "status": "ACTIVE",
    "priority": "HIGH"
  }'
```

#### 2. Ajouter des articles au projet

```bash
# Ajouter 10 carreaux
curl -X POST http://localhost:3000/projects/1/items/123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"quantity": 10}'

# Ajouter 2 robinets
curl -X POST http://localhost:3000/projects/1/items/456 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"quantity": 2}'
```

→ **Les scores des articles 123 et 456 sont automatiquement calculés**

#### 3. Consulter les articles les plus importants

```bash
curl -X GET http://localhost:3000/projects/scoring/top-items \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Vérifier les articles critiques

```bash
curl -X GET http://localhost:3000/projects/scoring/critical-items \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. Modifier la priorité du projet

```bash
curl -X PATCH http://localhost:3000/projects/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"priority": "CRITICAL"}'
```

→ **Les scores de tous les articles du projet sont recalculés automatiquement**

### Utilisation des scores dans votre application

#### Trier les articles par importance

```typescript
// Au lieu de récupérer tous les articles
GET / items;

// Récupérer les articles triés par importance
GET / projects / scoring / top - items;
```

#### Alertes intelligentes

```typescript
// Combiner les alertes de stock avec les scores d'importance
const criticalItems = await fetch('/projects/scoring/critical-items');
// Afficher en priorité les articles critiques (score élevé + stock faible)
```

#### Dashboard de gestion

```typescript
// Statistiques pour le dashboard admin
const stats = await fetch('/projects/scoring/statistics');
// Afficher la répartition des scores et identifier les articles sans projets
```

#### Analyse d'impact d'un projet

```typescript
// Voir quels articles sont impactés par un projet
const projectBreakdown = await fetch('/projects/1/scoring/breakdown');
// Comprendre la contribution de chaque article au projet
```

---

Ce système fournit une gestion intelligente de l'inventaire basée sur l'utilisation réelle dans les projets, permettant de prioriser automatiquement les articles les plus critiques pour le bon déroulement de vos projets.

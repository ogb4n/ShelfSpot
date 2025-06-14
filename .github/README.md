# 🤖 GitHub Actions for ShelfSpot

Ce dossier contient les workflows GitHub Actions automatisés pour le projet ShelfSpot.

## 📋 Workflows Disponibles

### 1. **CI/CD Pipeline** (`ci-cd.yml`)
- **Déclencheur**: Push sur `main`/`develop`, Pull Requests
- **Actions**:
  - Tests et linting du code
  - Build Docker multi-architecture (AMD64/ARM64)
  - Publication sur GitHub Container Registry
  - Scan de sécurité avec Trivy

### 2. **Release Automatique** (`release.yml`)
- **Déclencheur**: Tags `v*` (ex: `v1.0.0`)
- **Actions**:
  - Build et publication d'images Docker taguées
  - Génération automatique du changelog
  - Création de release GitHub avec assets
  - Upload du `docker-compose.yml`

### 3. **Audit de Sécurité** (`security.yml`)
- **Déclencheur**: Hebdomadaire + Push sur `main`
- **Actions**:
  - Audit des dépendances npm/yarn
  - Scan de vulnérabilités Docker
  - Validation du schéma Prisma
  - Lint Dockerfile avec Hadolint

### 4. **Mise à jour des Dépendances** (`dependency-updates.yml`)
- **Déclencheur**: Hebdomadaire (dimanche 2h00 UTC)
- **Actions**:
  - Mise à jour automatique des dépendances
  - Mise à jour de l'image Node.js base
  - Tests de build après mise à jour
  - Création de Pull Requests automatiques

### 5. **Contrôles de Santé** (`health-check.yml`)
- **Déclencheur**: Toutes les heures + Manuel
- **Actions**:
  - Test de démarrage de l'application
  - Vérification des endpoints
  - Analyse des performances
  - Check des headers de sécurité

### 6. **Documentation Automatique** (`documentation.yml`)
- **Déclencheur**: Push sur `main` (changements dans src/, README, etc.)
- **Actions**:
  - Génération de documentation API
  - Documentation des composants
  - Guide de déploiement
  - Changelog automatique

## 🚀 Configuration Requise

### Secrets GitHub (optionnels)
Tous les workflows utilisent `GITHUB_TOKEN` par défaut, aucun secret personnalisé requis.

### Permissions Repository
- **Actions**: Activées
- **Packages**: Activés (pour GitHub Container Registry)
- **Security**: Activé (pour les scans de vulnérabilités)

## 📦 Images Docker

Les images sont automatiquement publiées sur GitHub Container Registry :
```bash
ghcr.io/votre-username/shelfspot:latest
ghcr.io/votre-username/shelfspot:v1.0.0
```

## 🔧 Utilisation

### Créer une Release
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Déclencher Manuellement
- Via l'interface GitHub Actions
- Workflow "Health Check" permet de tester une URL personnalisée

### Surveiller les Mises à Jour
- Les PRs de mise à jour sont créées automatiquement
- Review et merge selon vos besoins

## 📊 Badges pour le README

Ajoutez ces badges à votre README principal :

```markdown
![CI/CD](https://github.com/votre-username/shelfspot/workflows/CI/CD%20Pipeline/badge.svg)
![Security](https://github.com/votre-username/shelfspot/workflows/Security%20Audit/badge.svg)
![Docker](https://img.shields.io/docker/v/ghcr.io/votre-username/shelfspot)
```

## 🛡️ Sécurité

- Scans de vulnérabilités automatiques
- Mises à jour de sécurité prioritaires
- Images Docker multi-architecture sécurisées
- Validation continue du code

## 📈 Monitoring

- Checks de santé horaires
- Alertes sur les performances
- Monitoring des builds
- Rapports de sécurité dans l'onglet Security

## 🤝 Contribution

Les workflows sont configurés pour :
- Valider les Pull Requests
- Maintenir la qualité du code
- Faciliter les releases
- Automatiser la maintenance

---

*Ces workflows sont optimisés pour une application auto-hébergée et incluent toutes les bonnes pratiques DevOps.*

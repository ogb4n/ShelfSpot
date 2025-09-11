# ShelfSpot - Complete Documentation

**ShelfSpot** is an open-source, self-hosted inventory management application designed to provide complete organization and traceability of items in your home or small warehouse. This documentation covers the complete architecture, features, deployment, and development guidelines.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Core Features](#core-features)
4. [API Documentation](#api-documentation)
5. [Authentication System](#authentication-system)
6. [Frontend Architecture](#frontend-architecture)
7. [Mobile App Integration](#mobile-app-integration)
8. [Deployment Guide](#deployment-guide)
9. [Development Setup](#development-setup)
10. [Configuration](#configuration)
11. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

ShelfSpot follows a modern three-tier architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│    Backend      │◄──►│   Database      │
│   (Next.js)     │    │   (NestJS)      │    │   (MySQL)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
   Web Interface           REST API              Data Storage
    React Components      JWT Authentication     Prisma ORM
                          Swagger Documentation  Migrations
```

### Key Components

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS with TypeScript, Prisma ORM, JWT Authentication
- **Database**: MySQL/MariaDB with structured schema
- **Mobile**: iPhone app with Expo push notifications
- **Deployment**: Docker containers with health checks

---

## Technology Stack

### Backend Technologies

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Database**: MySQL/MariaDB
- **ORM**: Prisma 6.x
- **Authentication**: JWT with Passport.js
- **Documentation**: Swagger/OpenAPI 3.0
- **Email**: Resend service
- **Push Notifications**: Expo Server SDK
- **Validation**: Class Validator
- **Testing**: Jest

### Frontend Technologies

- **Framework**: Next.js 15.x
- **Language**: TypeScript 5.x
- **UI Framework**: React 19.x
- **Styling**: Tailwind CSS 4.x
- **Components**: Headless UI, Radix UI
- **Icons**: Heroicons, Lucide React
- **Charts**: Chart.js with React wrapper
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API

### DevOps & Tools

- **Containerization**: Docker with multi-stage builds
- **Database Migrations**: Prisma Migrate
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git with conventional commits
- **CI/CD**: GitHub Actions (CodeQL analysis)

---

## Core Features

### 🏠 Inventory Management

- **Hierarchical Organization**: Items → Containers → Places → Rooms
- **Advanced Search**: Full-text search with filters
- **Tags System**: Flexible categorization with icons
- **Status Tracking**: Custom status fields per item
- **Image Support**: Item photos and visual identification
- **Price Tracking**: Purchase and selling price management
- **Quantity Management**: Stock levels with automatic alerts

### 🔔 Smart Alerts & Notifications

- **Automated Scoring**: Importance algorithm based on project usage
- **Threshold Alerts**: Customizable quantity thresholds
- **Multi-Channel Notifications**: Email and mobile push notifications
- **Alert Management**: Enable/disable, naming, scheduling
- **Anti-Spam Protection**: Cooldown periods between alerts

### 📊 Projects & Scoring System

- **Project Management**: Active, completed, paused, cancelled projects
- **Priority Levels**: Low, medium, high, critical priorities
- **Item Scoring**: Dynamic importance calculation based on:
  - Active project participation
  - Project priority multipliers
  - Multi-project bonus scoring
  - Paused project partial scoring
- **Analytics**: Comprehensive project statistics and breakdowns

### 👥 User Management

- **Multi-User Support**: Role-based access control
- **Admin Panel**: User creation, modification, deletion
- **Authentication**: JWT-based security with refresh tokens
- **Profile Management**: User preferences and notification settings
- **Password Recovery**: Email-based reset with temporary passwords

### 📱 Mobile Integration

- **iPhone App**: Native mobile application support
- **Push Notifications**: Real-time alerts via Expo
- **Token Management**: Automatic device registration
- **Cross-Platform**: Consistent experience across devices

### 📈 Analytics & Reporting

- **Dashboard Statistics**: Real-time inventory metrics
- **Room Distribution**: Visual breakdown by location
- **Inventory Value**: Total value calculations
- **Alert Trends**: Monthly alert statistics
- **Scoring Analytics**: Importance distribution insights

---

## API Documentation

The backend provides a comprehensive REST API documented with Swagger/OpenAPI 3.0.

### Base URL

```
http://localhost:3001/api
```

### API Documentation

```
http://localhost:3001/api/swagger
```

## Authentication System

### JWT Implementation

- **Algorithm**: HS256
- **Expiration**: 1 hour
- **Issuer**: `shelfspot-api`
- **Audience**: `shelfspot-app`

### Token Structure

```typescript
interface JwtPayload {
  sub: string; // User ID
  email?: string; // User email
  name?: string; // User name
  admin?: boolean; // Admin flag
  notificationToken?: string; // Mobile push token
  iat?: number; // Issued at
  exp?: number; // Expiration
}
```

### Authentication Flow

1. **Login**: POST `/auth/login` with email/password
2. **Token Generation**: JWT signed with secret
3. **Token Storage**: localStorage + HTTP-only cookies
4. **Request Authentication**: Bearer token in Authorization header
5. **Token Validation**: JwtAuthGuard validates and extracts user info
6. **Profile Access**: Authenticated routes access user via `@CurrentUser()` decorator

### Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Token Validation**: Automatic user existence check
- **Route Protection**: Guards for authenticated and admin routes
- **CORS Configuration**: Restricted origins for security
- **Input Validation**: Class-validator for request DTOs

---

## Frontend Architecture

### Project Structure

```
frontend/src/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # Authentication routes group
│   │   ├── login/
│   │   └── register/
│   ├── (pages)/           # Main application routes
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── manage/
│   │   ├── projects/
│   │   └── settings/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── types.d.ts         # Type definitions
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── modals/           # Modal dialogs
│   └── charts/           # Chart components
├── lib/                  # Utility libraries
│   ├── backend-api.ts    # API client
│   ├── auth-context.tsx  # Authentication context
│   └── utils.ts          # Helper functions
└── hooks/                # Custom React hooks
    ├── useApiData.ts
    ├── useGetRooms.ts
    └── useGetProjects.ts
```

### State Management

- **Authentication**: React Context with localStorage persistence
- **API Data**: Custom hooks with caching and error handling
- **Form State**: React Hook Form with Zod validation
- **UI State**: Component-level useState for modals and interactions

### Key Components

#### Authentication Context

```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}
```

#### API Client

```typescript
class BackendApiService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  async request(endpoint: string, options?: RequestInit) {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    });

    if (!response.ok) {
      throw new BackendApiError(response.status, await response.text());
    }

    return response.json();
  }
}
```

### Routing & Middleware

- **App Router**: Next.js 13+ file-based routing
- **Route Groups**: Organized by functionality
- **Middleware**: Authentication checks and redirects
- **Protected Routes**: Automatic login redirects
- **Admin Routes**: Role-based access control

---

## Mobile App Integration

### Push Notifications

ShelfSpot integrates with Expo's push notification service for real-time alerts on mobile devices.

#### Implementation

```typescript
// Backend: Expo Server SDK
import { Expo, ExpoPushMessage } from "expo-server-sdk";

@Injectable()
export class PushNotificationService {
  private expo = new Expo();

  async sendPushNotifications(
    pushTokens: string[],
    notification: PushNotificationData
  ): Promise<void> {
    const messages: ExpoPushMessage[] = pushTokens.map((token) => ({
      to: token,
      sound: "default",
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
    }));

    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      const tickets = await this.expo.sendPushNotificationsAsync(chunk);
      this.handlePushTickets(tickets);
    }
  }
}
```

#### Token Management

- **Registration**: Mobile app registers Expo push token
- **Storage**: Token stored in user profile
- **Updates**: Automatic token refresh and validation
- **Multi-Device**: Support for multiple devices per user

#### Notification Types

```typescript
interface PushNotificationData {
  title: string;
  body: string;
  data?: {
    type: "low_stock_alert" | "test" | "general";
    itemId?: number;
    itemName?: string;
    currentQuantity?: number;
    threshold?: number;
  };
}
```

### Mobile Features

- **Full API Access**: Complete inventory management
- **Real-Time Sync**: Automatic data synchronization
- **Offline Support**: Basic caching for critical data
- **Image Capture**: Item photo management
- **Barcode Scanning**: Quick item identification (planned)

---

## Deployment Guide

ShelfSpot offers flexible deployment options for different infrastructure needs.

### Option 1: External Database (Production Recommended)

#### Prerequisites

- Docker and Docker Compose
- MySQL/MariaDB database server
- Domain name (optional, for SSL)

#### Setup Steps

1. **Clone Repository**

```bash
git clone https://github.com/ogb4n/ShelfSpot.git
cd ShelfSpot
```

2. **Configure Environment**

```bash
cp backend/.env.example backend/.env
```

3. **Edit Configuration**

```bash
# backend/.env
DATABASE_URL="mysql://username:password@host.docker.internal:3306/database_name"
JWT_SECRET="your_super_secure_jwt_secret_here"
RESEND_API_KEY="your_resend_api_key"
RESEND_FROM_EMAIL="ShelfSpot <noreply@yourdomain.com>"
ALERT_EMAIL_RECIPIENT="admin@yourdomain.com"
```

4. **Deploy Services**

```bash
docker-compose up -d
```

#### Services Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/swagger

### Option 2: Complete Installation (All-in-One)

#### Setup Steps

1. **Configure Full Environment**

```bash
cp .env.full.example .env.full
```

2. **Edit Full Configuration**

```bash
# .env.full
DB_ROOT_PASSWORD=YourSecureRootPassword
DB_NAME=shelfspot
DB_USER=shelfspot_user
DB_PASSWORD=YourSecureUserPassword
JWT_SECRET=your_super_secure_jwt_secret_key
BACKEND_PORT=3001
FRONTEND_PORT=3000
DB_PORT=3306
```

3. **Deploy Full Stack**

```bash
docker-compose -f docker-compose.full.yml --env-file .env.full up -d
```

### Production Considerations

#### Security

```bash
# Strong passwords
DB_ROOT_PASSWORD=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
```

#### SSL/TLS with Reverse Proxy

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name shelfspot.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Backup Strategy

```bash
# Database backup
docker exec shelfspot-db mysqldump -u root -p$DB_ROOT_PASSWORD shelfspot > backup_$(date +%Y%m%d_%H%M%S).sql

# Volume backup
docker run --rm -v shelfspot_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_data_backup.tar.gz /data
```

#### Monitoring

```bash
# Health checks
docker-compose ps
curl -f http://localhost:3000/api/health || exit 1
curl -f http://localhost:3001/api/health || exit 1

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Development Setup

### Prerequisites

- Node.js 20.x or higher
- npm/yarn package manager
- MySQL/MariaDB database
- Git

### Local Development

#### Backend Setup

```bash
cd backend

# Install dependencies
yarn

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
yarn prisma generate

# Run migrations
yarn prisma migrate dev

# Start development server
yarn start:dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
yarn

# Configure environment
cp .env.example .env.local
# Edit .env.local with backend URL

# Start development server
yarn dev
```

### Development Commands

#### Backend

```bash
# Development
yarn start:dev          # Watch mode
yarn start:debug        # Debug mode

# Building
yarn build              # Production build
yarn start:prod         # Production mode

# Database
yarn prisma studio          # Database GUI
yarn prisma migrate dev     # Create migration
yarn prisma migrate deploy  # Apply migrations
npx prisma db seed         # Seed database

# Testing
yarn test               # Unit tests
yarn test:e2e           # End-to-end tests
yarn test:cov           # Coverage report

# Code Quality
yarn lint               # ESLint
yarn format             # Prettier
```

#### Frontend

```bash
# Development
yarn run dev               # Development server
yarn run build             # Production build
yarn run start             # Production server

# Code Quality
yarn run lint              # ESLint
yarn run type-check        # TypeScript check
```

### Database Management

#### Prisma Commands

```bash
# Schema changes
yarn prisma db push        # Push schema changes
yarn prisma migrate dev --name "description"  # Create migration

# Data management
yarn prisma studio         # Visual database editor
yarn prisma db seed        # Run seed scripts

# Client generation
yarn prisma generate       # Regenerate Prisma client
```

#### Migration Best Practices

```bash
# 1. Make schema changes in schema.prisma
# 2. Create migration
yarn prisma migrate dev --name "add_user_preferences"

# 3. Review generated migration file
# 4. Test migration in development
# 5. Apply to production
yarn prisma migrate deploy
```

### Code Quality

#### ESLint Configuration

```json
{
  "extends": ["@nestjs", "prettier"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": "warn"
  }
}
```

#### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## Configuration

### Environment Variables

#### Backend Configuration

```bash
# Database
DATABASE_URL="mysql://user:pass@localhost:3306/shelfspot"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"

# Email Service (Resend)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="ShelfSpot <noreply@yourdomain.com>"

# Alerts
ALERT_EMAIL_RECIPIENT="admin@yourdomain.com"

# Server
PORT=3001
NODE_ENV=production

# CORS (optional)
FRONTEND_URL="http://localhost:3000"
```

#### Frontend Configuration

```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Build Configuration
NODE_ENV=production
```

### Service Configuration

#### Resend Email Setup

1. Create account at [resend.com](https://resend.com)
2. Generate API key
3. Add domain (optional)
4. Configure environment variables

#### Push Notifications Setup

1. Create Expo account
2. Install Expo CLI: `npm install -g @expo/cli`
3. Configure push tokens in mobile app
4. Backend automatically handles Expo integration

### Database Configuration

#### MySQL Optimization

```sql
-- my.cnf optimizations
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 64M
```

#### Prisma Configuration

```javascript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

---

## Troubleshooting

### Common Issues

#### Database Connection Problems

```bash
# Check database connectivity
mysql -h localhost -u shelfspot_user -p shelfspot

# Verify Docker network
docker network ls
docker network inspect shelfspot_app_network

# Check container logs
docker-compose logs database
```

#### JWT Token Issues

```bash
# Verify JWT secret is set
echo $JWT_SECRET

# Check token validity
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/auth/profile

# Clear browser storage
localStorage.clear();
```

#### Build Failures

```bash
# Clear dependency cache
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build

# Docker build issues
docker system prune -a
docker-compose build --no-cache
```

#### API Connection Issues

```bash
# Check backend status
curl http://localhost:3001/api/health

# Verify CORS configuration
# Check browser network tab for OPTIONS requests

# Test direct API calls
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Health Checks

#### System Health Endpoint

```typescript
@Controller("health")
export class HealthController {
  @Get()
  async getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
      version: process.env.npm_package_version,
    };
  }
}
```

---

## Support

- **Documentation**: This file and inline code comments
- **API Documentation**: Available at `/api/swagger` when running
- **Issues**: GitHub Issues for bug reports and feature requests

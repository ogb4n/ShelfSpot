# ShelfSpot Installation Guide

This guide provides step-by-step instructions for installing ShelfSpot using two different methods: **Classic Install** (minimal setup) and **Complete Install** (full stack with database).

## Prerequisites

Before you begin, ensure you have the following requirements:

- **Docker Engine** (version 20.10 or higher)
- **Docker Compose** (v1.29 or higher, or Docker Compose v2)
- **Git** (to clone the repository)
- **Linux/macOS/Windows** with Docker support
- At least **2GB RAM** and **5GB disk space**

### Installing Docker

If you don't have Docker installed:

- **Linux**: Follow the [official Docker installation guide](https://docs.docker.com/engine/install/)
- **macOS**: Download [Docker Desktop for Mac](https://docs.docker.com/desktop/mac/install/)
- **Windows**: Download [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/install/)

Verify your installation:

```bash
docker --version
docker-compose --version
```

## Installation Methods

Choose the method that best fits your needs:

### Method 1: Classic Install (Recommended for Development)

The classic install provides a minimal setup that builds and runs the ShelfSpot application without a bundled database. This method is ideal for:

- Development and testing
- Quick demos
- When you have an existing database server

#### Steps:

1. **Navigate to the classic install directory:**

   ```bash
   cd install/classic_install
   ```

2. **Make the build script executable:**

   ```bash
   chmod +x build.sh
   ```

3. **Run the build script:**

   ```bash
   ./build.sh
   ```

   This script will:

   - Build Docker images for both frontend and backend
   - Verify that images are created successfully

4. **Configure environment variables:**
   Ensure you have a `.env` file in the `backend` directory with your database configuration:

   ```bash
   # Example .env file
   DATABASE_URL="mysql://user:password@host:3306/shelfspot"
   JWT_SECRET="your-secret-key"
   ```

5. **Start the services:**

   ```bash
   docker-compose up -d
   ```

6. **Verify the installation:**

   ```bash
   docker-compose ps
   ```

   Check that services are running:

   - **Backend**: Available at `http://localhost:3001`
   - **Frontend**: Available at `http://localhost:3000`

7. **View logs (if needed):**
   ```bash
   docker-compose logs -f
   ```

#### Services included:

- **Backend API** (NestJS) on port 3001
- **Frontend** (Next.js) on port 3000

### Method 2: Complete Install (Production-Ready)

The complete install provides a full-stack deployment including a MariaDB database and all necessary services. This method is ideal for:

- Production deployments
- Complete local testing environment
- When you want everything pre-configured

#### Steps:

1. **Navigate to the complete install directory:**

   ```bash
   cd install/complete_install
   ```

2. **Make the build script executable:**

   ```bash
   chmod +x build.sh
   ```

3. **Run the build script:**

   ```bash
   ./build.sh
   ```

   This script will prepare all necessary components for the full stack deployment.

4. **Configure environment variables (optional):**
   Create a `.env` file to override default settings:

   ```bash
   # Optional .env file for complete install
   DB_ROOT_PASSWORD=your-root-password
   DB_NAME=shelfspot
   DB_USER=shelfspot_user
   DB_PASSWORD=your-user-password
   DB_PORT=3306
   ```

5. **Start the complete stack:**

   ```bash
   docker-compose -f docker-compose.full.yml up -d
   ```

6. **Wait for database initialization:**
   The database needs time to initialize. Monitor the process:

   ```bash
   docker-compose -f docker-compose.full.yml logs -f database
   ```

   Wait until you see "ready for connections" in the logs.

7. **Run database migrations (if needed):**

   ```bash
   docker-compose -f docker-compose.full.yml exec backend npm run prisma:migrate:deploy
   ```

8. **Verify the installation:**

   ```bash
   docker-compose -f docker-compose.full.yml ps
   ```

   All services should be healthy:

   - **Database** (MariaDB) on port 3306
   - **Backend API** on port 3001
   - **Frontend** on port 3000

#### Services included:

- **MariaDB Database** on port 3306
- **Backend API** (NestJS) on port 3001
- **Frontend** (Next.js) on port 3000
- **Database initialization scripts** (in `database/init/`)

## Post-Installation

### Accessing the Application

Once installation is complete, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api (Swagger)

### Default Credentials

If using the complete install with default settings:

- **Database**:
  - Host: localhost:3306
  - Database: shelfspot
  - User: shelfspot_user
  - Password: ShelfSpot2024!

### Health Checks

Both installation methods include health checks:

```bash
# Check all services
docker-compose ps

# Check specific service logs
docker-compose logs backend
docker-compose logs frontend

# For complete install
docker-compose -f docker-compose.full.yml logs database
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**

   ```bash
   # Check what's using the ports
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :3001
   sudo netstat -tulpn | grep :3306
   ```

2. **Docker permission issues:**

   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   # Then logout and login again
   ```

3. **Database connection issues:**

   - Ensure the database container is healthy
   - Check environment variables in `.env` files
   - Verify network connectivity between containers

4. **Build failures:**
   ```bash
   # Clean Docker cache and rebuild
   docker system prune -a
   docker-compose down -v
   # Then run the build script again
   ```

### Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs <service-name>`
2. Verify all containers are running: `docker-compose ps`
3. Check the documentation in the `documentation/` folder
4. Review the specific service README files in `backend/` and `frontend/`

## Stopping and Cleanup

### Stop services:

```bash
# Classic install
docker-compose down

# Complete install
docker-compose -f docker-compose.full.yml down
```

### Complete cleanup (removes data):

```bash
# Remove containers, networks, and volumes
docker-compose down -v

# For complete install
docker-compose -f docker-compose.full.yml down -v
```

## Development Notes

- For development, the classic install is recommended as it's faster to start/stop
- Use the complete install when you need to test database-specific features
- Both methods support hot-reloading during development
- Environment variables can be customized in the respective `.env` files

For more detailed information, check the documentation in the `documentation/` folder and the individual component README files.

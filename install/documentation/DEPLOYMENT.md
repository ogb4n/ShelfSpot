# ShelfSpot Deployment Guide

ShelfSpot offers two deployment options to fit different infrastructure needs:

## Option 1: External Database (Recommended for Production)

Use this option if you already have a MySQL/MariaDB database running or want to use an external database service.

### Setup

1. Copy the environment file:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` with your database credentials:

   ```bash
   DATABASE_URL="mysql://username:password@host.docker.internal:3306/database_name?schema=public"
   JWT_SECRET="your_jwt_secret_here"
   # Add other configuration as needed
   ```

3. Run the application:
   ```bash
   docker-compose up -d
   ```

### Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: Your existing database

## Option 2: Full Installation (All-in-One)

Use this option for a complete installation including a MariaDB database. Perfect for development or when you don't have an existing database infrastructure.

### Setup

1. Copy the environment file:

   ```bash
   cp .env.full.example .env.full
   ```

2. Edit `.env.full` with your desired configuration:

   ```bash
   # Database Configuration
   DB_ROOT_PASSWORD=YourSecurePassword
   DB_NAME=shelfspot
   DB_USER=shelfspot_user
   DB_PASSWORD=YourSecureUserPassword

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key

   # Ports (optional, defaults shown)
   BACKEND_PORT=3001
   FRONTEND_PORT=3000
   DB_PORT=3306
   ```

3. Run the full stack:
   ```bash
   docker-compose -f docker-compose.full.yml --env-file .env.full up -d
   ```

### Services

- **Frontend**: http://localhost:3000 (or your configured port)
- **Backend API**: http://localhost:3001 (or your configured port)
- **Database**: MariaDB on localhost:3306 (or your configured port)

## Database Migrations

For both options, you may need to run database migrations after the first startup:

```bash
# Enter the backend container
docker exec -it shelfspot-backend sh

# Run Prisma migrations
npx prisma migrate deploy
```

## Health Checks

Both configurations include health checks for all services. You can monitor the status with:

```bash
docker-compose ps
# or for full installation
docker-compose -f docker-compose.full.yml ps
```

## Stopping Services

```bash
# External database setup
docker-compose down

# Full installation
docker-compose -f docker-compose.full.yml down

# To also remove volumes (WARNING: This will delete all data)
docker-compose -f docker-compose.full.yml down -v
```

## Production Considerations

### For External Database Setup:

- Ensure your database server allows connections from Docker containers
- Use strong passwords and secure connection strings
- Consider using Docker secrets for sensitive data

### For Full Installation:

- Change all default passwords in `.env.full`
- Use a reverse proxy (nginx/traefik) for SSL termination
- Backup the `mysql_data` volume regularly
- Consider using Docker secrets for production deployments

## Troubleshooting

### Database Connection Issues

- Verify your database is accessible from Docker containers
- Check firewall settings
- Ensure the database user has proper permissions

### Container Health Issues

- Check logs: `docker-compose logs [service_name]`
- Verify all environment variables are set correctly
- Ensure all required ports are available

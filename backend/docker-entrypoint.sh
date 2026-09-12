#!/bin/sh

echo "Starting ShelfSpot Backend..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until ./node_modules/.bin/prisma db push --accept-data-loss 2>/dev/null; do
  echo "Database is unavailable - waiting 3 seconds..."
  sleep 3
done

echo "Database is ready!"

# Apply Prisma migrations
echo "Applying database migrations..."
./node_modules/.bin/prisma migrate deploy

# Start the application
echo "Starting the application..."
exec node dist/main

#!/bin/sh
set -e

echo "Checking migration status..."

# Check if _prisma_migrations table exists and has records
MIGRATION_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM _prisma_migrations;" 2>/dev/null || echo "0")

# Remove whitespace from count
MIGRATION_COUNT=$(echo "$MIGRATION_COUNT" | tr -d ' ')

if [ "$MIGRATION_COUNT" = "0" ] || [ -z "$MIGRATION_COUNT" ]; then
  echo "No migrations found in database. Baselining initial migration..."

  # Baseline the init migration
  npx prisma migrate resolve --applied "20260125140605_init"

  echo "Initial migration baselined successfully."
else
  echo "Found $MIGRATION_COUNT existing migration(s). Skipping baseline."
fi

# Run remaining migrations
echo "Running migrations..."
npx prisma migrate deploy

echo "Migrations completed successfully."

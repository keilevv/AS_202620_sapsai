#!/bin/sh
set -e

# Wait for Postgres if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for database..."
  ATTEMPTS_LEFT=30
  until bunx prisma migrate status >/dev/null 2>&1 || [ $ATTEMPTS_LEFT -eq 0 ]; do
    ATTEMPTS_LEFT=$((ATTEMPTS_LEFT - 1))
    echo "Database not ready yet. Attempts left: $ATTEMPTS_LEFT"
    sleep 2
  done

  echo "Running prisma migrate deploy..."
  bunx prisma migrate deploy
  echo "Prisma migrate deploy completed."
  echo "Generating Prisma client..."
  bunx prisma generate
fi

# Start the production server (not in watch mode)
exec bun run src/server.ts

# Development Dockerfile
FROM oven/bun:1

WORKDIR /usr/src/app

# Install dependencies first
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN bunx prisma generate

# Copy source code
COPY . .

# Set proper permissions
RUN chown -R bun:bun /usr/src/app

ENV PORT=5000

# Expose port for development
EXPOSE 5000

# Start the development server with hot-reload
USER bun
CMD ["bun", "run", "dev"]

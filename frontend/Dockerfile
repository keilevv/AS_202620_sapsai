# syntax=docker/dockerfile:1

# Build stage
FROM oven/bun:1.1-alpine AS build
WORKDIR /app

# Accept Vite envs at build time
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package.json ./
RUN bun install

COPY . .

# Build static assets
RUN bunx --bun vite build

# Runtime stage
FROM nginx:1.27-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=build /app/dist .

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Default Nginx command
CMD ["nginx", "-g", "daemon off;"]

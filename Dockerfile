# Use the official Node.js runtime as the base image
FROM node:24 AS build

# Set the working directory in the container
WORKDIR /app

# Copy package files for the monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/flowvia-lib/package.json ./packages/flowvia-lib/
COPY packages/flowvia-app/package.json ./packages/flowvia-app/
COPY packages/flowvia-backend/package.json ./packages/flowvia-backend/

# Install dependencies for the entire workspace
RUN corepack enable && corepack prepare pnpm@10 --activate && pnpm install --frozen-lockfile

# Copy the entire monorepo code
COPY . .

# Build the library first, then the app
RUN pnpm run build:lib && pnpm run build:app

# Use Node with nginx for production
FROM node:24-alpine

# Install web server packages
RUN apk add --no-cache nginx openssl su-exec

# Copy backend code
COPY --from=build /app/packages/flowvia-backend /app/packages/flowvia-backend

WORKDIR /app/packages/flowvia-backend
RUN npm install --omit=dev

# Copy the built React app to Nginx's web server directory
COPY --from=build /app/packages/flowvia-app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create data directory for persistent storage
RUN mkdir -p /data/diagrams

# Expose ports
EXPOSE 80 3001

# Environment variables with defaults
ENV ENABLE_SERVER_STORAGE=true
ENV STORAGE_PATH=/data/diagrams
ENV BACKEND_PORT=3001

# Start services
ENTRYPOINT ["/docker-entrypoint.sh"]

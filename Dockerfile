# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock ./

# Enable corepack and install dependencies
RUN corepack enable && \
    yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create nginx group and user with the required UID for OKD SCC, only if not already present
RUN id -u nginx >/dev/null 2>&1 || addgroup -g 1001 -S nginx
RUN id -u nginx >/dev/null 2>&1 || adduser -S -D -H -u 1005220000 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create necessary directories and set permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /tmp/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /tmp/nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

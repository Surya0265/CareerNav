# ─── Stage 1: Build the React app ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./
RUN npm install

# Copy all source files and build
COPY . .
# Limit Node heap to 512MB — prevents OOM on EC2 t3.micro (1GB RAM)
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build
# Output is in /app/dist

# ─── Stage 2: Serve with Nginx (tiny, fast, production-grade) ────────────────
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx config (handles React Router client-side routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
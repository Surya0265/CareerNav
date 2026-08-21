FROM node:20-alpine

WORKDIR /app

# Copy package files first (layer caching - npm install only re-runs if deps change)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose the port Node.js listens on
EXPOSE 3011

# Health check so docker-compose knows when the service is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3011/ || exit 1

CMD ["node", "server.js"]
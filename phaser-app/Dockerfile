FROM node:20-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files from previous stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/websocket-server.js .
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy environment variable example as default
COPY .env.example .env

# Expose ports for Vite and WebSocket server
EXPOSE 4173
EXPOSE 8081

# Create start script
RUN echo '#!/bin/sh\nnode websocket-server.js & npx vite preview --host 0.0.0.0' > start.sh && \
    chmod +x start.sh

CMD ["./start.sh"]

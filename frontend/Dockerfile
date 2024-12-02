# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files from frontend directory
COPY package*.json ./

# Install dependencies
RUN npm ci && npm install -g npm@10.9.1

# Copy the rest of the frontend application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV PORT 3000
ENV NODE_ENV production

# Start the application
CMD ["node", "server.js"]

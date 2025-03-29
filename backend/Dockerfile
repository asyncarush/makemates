# Stage 1: Install dependencies and build the application
FROM node:18 AS builder

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production && npm install -g npm@10.9.1

# Install dev dependencies separately for tools like Prisma
RUN npm install --only=dev

# Copy the rest of the application source code to the container
COPY . .

# Generate Prisma client with correct binary target
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-1.1.x
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-slim

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Set environment variables
ENV PORT=2000
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 2000

# Command to run the application
CMD ["node", "./dist/index.js"]

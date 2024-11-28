# Stage 1: Install dependencies and build the application
FROM node:18 AS builder

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Install dev dependencies separately for tools like Prisma
RUN npm install --only=dev

# Copy the rest of the application source code to the container
COPY . .

# Generate Prisma client (if needed)
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-slim

# Set the working directory
WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]

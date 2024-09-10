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

# Stage 2: Create the final production image
FROM node:18-slim

# Install only serve and pm2 globally
RUN npm install -g serve pm2

# Set the working directory in the container
WORKDIR /app

# Copy production node_modules and application code from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Expose the port your application will run on
EXPOSE 3000

# Use PM2 to start the application in production mode
CMD ["pm2-runtime", "start", "index.js"]

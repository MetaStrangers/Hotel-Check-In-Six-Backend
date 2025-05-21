# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install build tools (if necessary)
RUN apk add --no-cache build-base python3

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (use --legacy-peer-deps if required for compatibility)
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Remove unnecessary dependencies and files
RUN npm prune --production

# Stage 2: Run
FROM node:20-alpine AS runner

# Install PM2 globally
RUN npm install -g pm2

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./


# Expose the port the app runs on
EXPOSE 3000

# Start the application with PM2
CMD ["pm2-runtime", "dist/main.js"]
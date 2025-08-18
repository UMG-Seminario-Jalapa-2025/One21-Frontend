# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy manifest files first for better build caching
COPY package*.json tsconfig.json ./

# Install ALL dependencies (including dev; required for 'tsx')
RUN npm ci

# Copy the rest of the source code
COPY . .

# Generate the icons required by the build
RUN npm run build:icons

# Build the Next.js application
RUN npm run build


# Stage 2: Runtime (lightweight)
FROM node:18-alpine AS runner
WORKDIR /app

# Install only production dependencies in the final image
COPY package*.json ./
RUN npm ci --only=production

# Copy build artifacts from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json

# Expose application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

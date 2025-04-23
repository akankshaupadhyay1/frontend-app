# Install dependencies
FROM node:20-alpine3.18 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Build the Next.js app
FROM base AS builder
COPY . .
RUN chmod +x env.sh
RUN npm run build

# Production image
FROM node:20-alpine3.18 AS runner
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --only=production

# Copy necessary build artifacts and public files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/env.sh ./env.sh

# Expose the port
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production

# Run the env.sh script to inject runtime config and start the app
CMD ["./env.sh"]


# # Use a multi-stage build for efficiency
# FROM node:20-alpine3.18 AS base
# WORKDIR /app
# COPY package*.json ./
# RUN npm install

# # Build stage
# FROM base AS builder
# COPY . .

# # Make sure env.sh is executable
# RUN chmod +x env.sh

# # Build the Next.js app
# RUN npm run build

# # Production image
# FROM base AS runner
# ENV NODE_ENV production
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public

# # Expose the port the app will run on
# EXPOSE 3000

# # Run the env.sh script to inject runtime config and start the app
# CMD ["./env.sh"]

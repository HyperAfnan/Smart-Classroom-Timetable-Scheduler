# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Define build arguments
ARG VITE_SENTRY_DSN
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_BACKEND_URL

# Set environment variables from build arguments
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Expose port 80
EXPOSE 8080

# Start Nginx
CMD ["npm", "run", "dev"]

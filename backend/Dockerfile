FROM node:22-alpine AS development
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

RUN npm ci

# Copy the rest of the application source code
COPY . .

# Command to run the application during development (optional, often handled by docker compose)
CMD [ "npm", "run", "dev" ]

# Stage 2: Create a minimal production image
FROM node:22-alpine AS production
WORKDIR /usr/src/app

# Only copy necessary files from the development stage
COPY --from=development /usr/src/app/package*.json ./
COPY --from=development /usr/src/app/node_modules ./
COPY --from=development /usr/src/app/. ./

# Define the port your app listens on
EXPOSE 5000

# Command to run the application in production
CMD [ "npm", "start" ]

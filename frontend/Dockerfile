# ---------- Build stage ----------
FROM node:20 AS build

WORKDIR /app

# Install deps only (use package-lock for reproducible installs)
COPY package*.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# ---------- Production stage ----------
FROM nginx:stable-alpine

# Remove default nginx static assets and copy built files
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

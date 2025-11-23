# Build stage
FROM node:24-alpine as builder

WORKDIR /app

# Copy package files from project root (monorepo setup)
COPY package.json pnpm-lock.yaml ./

# Copy all frontend source code
COPY frontend/ ./frontend/

# Pass VITE_SOCKET_URL as a build argument
ARG VITE_SOCKET_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile && \
    pnpm run build

# Runtime stage
FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

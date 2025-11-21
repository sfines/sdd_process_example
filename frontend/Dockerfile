# Build stage
FROM node:24-alpine as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY frontend ./frontend

RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

RUN cd frontend && pnpm run build

# Runtime stage
FROM nginx:alpine

COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

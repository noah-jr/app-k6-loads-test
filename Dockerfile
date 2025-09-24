
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM node:20-alpine AS nextjs
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start"]


FROM node:20-alpine AS k6base
RUN apk add --no-cache bash curl \
    && curl -fsSL https://github.com/grafana/k6/releases/download/v0.52.0/k6-v0.52.0-linux-amd64.tar.gz \
    | tar xz -C /usr/local/bin --strip-components=1
WORKDIR /app

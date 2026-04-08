FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 -G nodejs -s /bin/sh -D nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

RUN npm install -g serve

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5173', (r) => process.exit(r.statusCode === 200 ? 0 : 1))" || exit 1

CMD ["serve", "-s", "dist", "-l", "5173"]

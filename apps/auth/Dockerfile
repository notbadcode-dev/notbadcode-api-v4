# ---------- Base ----------
FROM node:22.14.0-alpine AS base
WORKDIR /app

# Añade todas las dependencias necesarias para Alpine y módulos nativos (incluyendo zsh, gcc, make, g++, python3)
RUN apk add --no-cache libc6-compat make gcc g++ python3 zsh

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY libs ./libs
RUN npm ci

# ---------- Build ----------
FROM base AS build
COPY . .
RUN npx nest build auth \
 && echo "== dist/apps/auth/src ==" && ls -la dist/apps/auth/src

# ---------- Runner ----------
FROM node:22.14.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 60200
CMD ["node", "dist/apps/auth/src/main.js"]

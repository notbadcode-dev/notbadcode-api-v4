# ---------- Base ----------
FROM node:22.14.0-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat make gcc g++ python3 zsh
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY libs ./libs
RUN npm ci

# ---------- Build ----------
FROM base AS build
COPY . .
RUN npx nest build links \
 && echo "== dist/apps/links/src ==" && ls -la dist/apps/links/src

# ---------- Runner ----------
FROM node:22.14.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache zsh
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 60201
CMD ["node", "dist/apps/links/src/main.js"]

# ---- deps ----
FROM node:18-alpine AS deps
WORKDIR /app

# Copy workspace manifests first (better layer caching)
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/utils/package.json packages/utils/package.json

RUN npm ci

# ---- build ----
FROM node:18-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# IMPORTANT: NEXT_PUBLIC_* env vars are inlined into client bundles at build time.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy source
COPY apps/web ./apps/web
COPY packages ./packages

# Build only the web workspace
RUN npm --workspace apps/web run build

# ---- run ----
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Keep it available for any server-side usage too.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy what Next needs at runtime
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --from=build /app/apps/web/next.config.js ./apps/web/next.config.js

# Node modules (includes workspace deps)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages

EXPOSE 8080
CMD ["npm", "--workspace", "apps/web", "run", "start"]
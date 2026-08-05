# HireTrail production image — Nest API + Angular SPA
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm install --workspaces --include-workspace-root

FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build --workspace=apps/web \
 && npm run build --workspace=apps/api

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm install --workspaces --include-workspace-root --omit=dev \
  && npm install better-sqlite3 --workspace=apps/api
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/web/dist apps/web/dist
RUN mkdir -p /app/data
EXPOSE 8080
CMD ["node", "apps/api/dist/main.js"]

# syntax=docker/dockerfile:1

FROM node:22-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
COPY apps/store/package.json apps/store/
COPY apps/web/package.json apps/web/
COPY packages/ui/package.json packages/ui/
COPY packages/triage/package.json packages/triage/
RUN npm ci --workspace apps/store

COPY packages/ui packages/ui
COPY apps/store apps/store

ENV BUILD_STANDALONE=1
RUN --mount=type=secret,id=contentful_space_id,env=CONTENTFUL_SPACE_ID \
    --mount=type=secret,id=contentful_access_token,env=CONTENTFUL_ACCESS_TOKEN \
    npm run build --workspace apps/store

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app/apps/store/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/store/.next/static ./apps/store/.next/static

USER node
EXPOSE 3001
CMD ["node", "apps/store/server.js"]
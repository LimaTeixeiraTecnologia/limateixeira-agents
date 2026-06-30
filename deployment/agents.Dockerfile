FROM node:22-bookworm-slim AS deps

WORKDIR /app/agents

COPY agents/package.json agents/package-lock.json ./

RUN npm ci

FROM deps AS build

WORKDIR /app/agents

COPY agents/tsconfig.json ./
COPY agents/src ./src
COPY docs/agents/marcos /app/docs/agents/marcos

RUN npm_config_cache=/tmp/.npm-cache npx mastra build --studio

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=4111
ENV MASTRA_HOST=0.0.0.0
ENV MASTRA_STORAGE_SCHEMA=agents
ENV MASTRA_STUDIO_PATH=/app/agents/.mastra/output/studio

WORKDIR /app/agents

RUN groupadd --system --gid 1001 mastra \
  && useradd --system --uid 1001 --gid mastra --create-home mastra

COPY --from=deps /app/agents/package.json /app/agents/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
  && npm cache clean --force

COPY --from=build /app/agents/.mastra/output ./.mastra/output
COPY docs/agents/marcos /app/docs/agents/marcos

USER mastra

EXPOSE 4111

CMD ["node", ".mastra/output/index.mjs"]

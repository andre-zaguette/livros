FROM node:22-bookworm-slim AS base

RUN apt-get update \
  && apt-get install -y --no-install-recommends poppler-utils \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# DATABASE_URL is only needed here so Next.js can statically import route
# modules (e.g. src/db/client.ts) while collecting page data at build time;
# no connection is actually made during the build. The real value is
# supplied at container start via docker-compose's `environment:`.
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=${DATABASE_URL}
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate && npm start"]

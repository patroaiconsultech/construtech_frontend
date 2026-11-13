FROM node:20.20.2-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# Explicit copy is intentional: it makes the Railway/Docker build fail fast
# if the canonical env contract is absent from the build context.
COPY .env.example ./.env.example

RUN npm run verify:release
RUN npm test
RUN npm run build

FROM node:20.20.2-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
WORKDIR /app
ENV NODE_ENV=production
USER node
COPY --from=build /app/dist ./dist
COPY server.mjs ./
EXPOSE 8080
CMD ["node","server.mjs"]

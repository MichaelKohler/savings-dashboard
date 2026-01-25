FROM node:24-alpine

WORKDIR /usr/server/app

# Install PostgreSQL client for migration baselining
RUN apk add --no-cache postgresql-client

COPY ./ .

# Provide DATABASE_URL for Prisma client generation during build
# This is a placeholder URL - the real DATABASE_URL is provided at runtime
ARG DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
ENV DATABASE_URL=$DATABASE_URL

RUN npm ci

RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "./scripts/migrate-with-baseline.sh && node ./dist/server/entry.mjs"]

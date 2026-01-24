FROM node:24-alpine

WORKDIR /usr/server/app

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

CMD ["node", "./dist/server/entry.mjs"]

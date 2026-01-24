FROM node:24-alpine

WORKDIR /usr/server/app

COPY ./ .
RUN npm ci

RUN npx prisma generate

RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", "./dist/server/entry.mjs"]

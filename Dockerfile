FROM node:24-alpine

WORKDIR /usr/server/app

COPY ./ .
RUN npm ci

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]

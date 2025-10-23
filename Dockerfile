FROM --platform=${BUILDPLATFORM:-linux/amd64} node:24-alpine

ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETOS
ARG TARGETARCH

WORKDIR /usr/server/app

COPY ./ .
RUN npm ci

RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]

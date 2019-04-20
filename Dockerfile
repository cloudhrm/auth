FROM node:10.15 AS build
WORKDIR /usr/src/app

COPY . .

RUN yarn install
RUN yarn build

COPY ./package.json ./dist/
COPY ./src/schema.graphql ./dist/src/schema.graphql
COPY ./prisma/datamodel.prisma ./dist/prisma/datamodel.prisma
COPY ./prisma/prisma.yml ./dist/prisma/prisma.yml

FROM node:10.15-alpine AS dependencies
WORKDIR /usr/src/app

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++

COPY --from=build /usr/src/app/dist .
RUN yarn install --production=true

FROM node:10.15-alpine AS release
WORKDIR /usr/src/app

LABEL maintainer="Gints Polis <polis.gints@gmail.com>"
LABEL description="Authorization backend for CloudHRM system"

COPY --from=dependencies /usr/src/app .

EXPOSE 4000

CMD ["yarn", "start:prod"]

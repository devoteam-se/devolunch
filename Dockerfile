FROM node:14.17.5-slim as install-client
WORKDIR /app

# install client dependencies
COPY client/package*.json ./
RUN npm ci --only=production

FROM node:14.17.5-slim as build-client
WORKDIR /app

COPY --from=install-client /app/node_modules/ /app/node_modules

# build client app
COPY client/ ./
RUN npm run build

FROM node:14.17.5-slim as install-server
WORKDIR /app

# install server dependencies
COPY server/package*.json ./
RUN npm ci --only=production

FROM node:14.17.5-slim as build-server
WORKDIR /app

COPY --from=install-server /app/node_modules/ /app/node_modules

# build the server app
COPY server/ ./
RUN npm run build

FROM node:14.17.5-slim
WORKDIR /app

COPY --from=build-client /app/build/ /app/client/build
COPY --from=install-server /app/node_modules/ /app/server/node_modules
COPY --from=build-server /app/dist/ /app/server/dist

# expose the port
EXPOSE 8080

# command to run when intantiate an image
CMD ["node", "./server/dist/index.js"]

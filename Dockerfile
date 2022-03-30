#    ___ _    ___ ___ _  _ _____ 
#   / __| |  |_ _| __| \| |_   _|
#  | (__| |__ | || _|| .` | | |  
#   \___|____|___|___|_|\_| |_|  

FROM node:14.17.5-slim as build-client
WORKDIR /app

# install client dependencies
COPY client/package*.json ./
RUN npm ci --only=production

# build client app
COPY client/ ./
RUN npm run build

#   ___ ___ _____   _____ ___ 
#  / __| __| _ \ \ / / __| _ \
#  \__ \ _||   /\ V /| _||   /
#  |___/___|_|_\ \_/ |___|_|_\

FROM node:14.17.5-slim as build-server
WORKDIR /app

# install server dependencies
COPY server/package*.json ./
RUN npm ci

# build the server app
COPY server/ ./
RUN npm run build

#   ___ _   _ _  _ 
#  | _ \ | | | \| |
#  |   / |_| | .` |
#  |_|_\\___/|_|\_|

FROM node:14.17.5-slim
WORKDIR /app/server

# copy built client and server
COPY --from=build-client /app/build/ /app/client/build
COPY --from=build-server /app/dist/ /app/server/dist

# install server dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# expose the port
EXPOSE 8080

# command to run when intantiate an image
CMD ["node", "./dist/index.js"]

FROM node:18-alpine as base
WORKDIR '/app'
COPY pnpm-lock.yaml ./
ENV CI=true
RUN npm install -g pnpm@8
RUN pnpm fetch
ADD . ./
RUN pnpm install --offline

#    ___ _    ___ ___ _  _ _____
#   / __| |  |_ _| __| \| |_   _|
#  | (__| |__ | || _|| .` | | |
#   \___|____|___|___|_|\_| |_|

FROM base as client-builder 
COPY . .
WORKDIR '/app/client'
RUN pnpm build

#   ___ ___ _____   _____ ___
#  / __| __| _ \ \ / / __| _ \
#  \__ \ _||   /\ V /| _||   /
#  |___/___|_|_\ \_/ |___|_|_\

FROM base as server-builder 
COPY . .
ENV CI=true
ENV HUSKY=0
RUN pnpm --filter server --prod deploy pruned
RUN pnpm --filter server deploy build 
WORKDIR '/app/server'
RUN pnpm build 

#   ___ _   _ _  _
#  | _ \ | | | \| |
#  |   / |_| | .` |
#  |_|_\\___/|_|\_|

FROM --platform=linux/amd64 node:18

# copy built client and server
COPY --from=server-builder /app/pruned/node_modules /server/node_modules
COPY --from=server-builder /app/server/dist/ /server/dist
COPY --from=client-builder /app/client/dist/ /client/dist

EXPOSE 8080
WORKDIR '/server'
CMD ["node", "./dist/index.js"]

FROM node:18-alpine as base

WORKDIR '/app'

COPY pnpm-lock.yaml ./

ENV CI=true

RUN npm install -g pnpm@8

RUN pnpm fetch 

ADD . ./

RUN pnpm install -r --offline --ignore-scripts

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

WORKDIR '/app/server'

RUN pnpm build 

#   ___ _   _ _  _
#  | _ \ | | | \| |
#  |   / |_| | .` |
#  |_|_\\___/|_|\_|

FROM --platform=linux/amd64 node:18-alpine

# copy built client and server
COPY --from=server-builder /app/server/dist/ /server/dist
COPY --from=client-builder /app/client/dist/ /client/dist

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Add user so we don't need --no-sandbox.
# same layer as npm install to keep re-chowned files from using up several hundred MBs more space
RUN groupadd -r runner && useradd -r -g runner -G audio,video runner \
    && mkdir -p /home/runner/Downloads \
    && chown -R runner:runner /home/runner

USER runner

EXPOSE 8080

WORKDIR '/server'

CMD ["node", "./dist/index.js"]

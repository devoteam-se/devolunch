#    ___ _    ___ ___ _  _ _____
#   / __| |  |_ _| __| \| |_   _|
#  | (__| |__ | || _|| .` | | |
#   \___|____|___|___|_|\_| |_|

FROM node:18-alpine as build-client
WORKDIR /home/runner

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

FROM node:18-alpine as build-server
WORKDIR /home/runner

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

FROM node:18
WORKDIR /home/runner/server

# copy built client and server
COPY --from=build-client /home/runner/dist/ /home/runner/client/dist
COPY --from=build-server /home/runner/dist/ /home/runner/server/dist

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

# install server dependencies
COPY server/package*.json ./

# Install node modules
RUN npm ci --only=production \
    # Add user so we don't need --no-sandbox.
    # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
    && groupadd -r runner && useradd -r -g runner -G audio,video runner \
    && mkdir -p /home/runner/Downloads \
    && chown -R runner:runner /home/runner

USER runner

# expose the port
EXPOSE 8080

# command to run when intantiate an image
CMD ["node", "--trace-warnings", "./dist/index.js"]

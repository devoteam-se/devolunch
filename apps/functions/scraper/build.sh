#!/bin/bash

# wonky bonky scripting, inspiration and explanation here:
# https://www.codejam.info/2023/04/firebase-functions-monorepo.html

# Create output folder
mkdir -p build

# Create tarball for shared package
cd ../../../packages/shared/ || exit
pnpm install --no-frozen-lockfile
pnpm build
pnpm pack
cp devolunch-shared-1.0.0.tgz ../../apps/functions/scraper/devolunch-shared-1.0.0.tgz

# Change devDependencies to point to the new tarball and include everything that's built into the zip
cd ../../apps/functions/scraper || exit
npm pkg set 'devDependencies.@devolunch/shared=file:devolunch-shared-1.0.0.tgz'
pnpm install --no-frozen-lockfile
npx make-dedicated-lockfile
pnpm build
cp -R package.json pnpm-lock.yaml .puppeteerrc.cjs dist devolunch-shared-1.0.0.tgz build
npm pkg set 'devDependencies.@devolunch/shared=workspace:'

# Clean up
rm -f devolunch-shared-1.0.0.tgz

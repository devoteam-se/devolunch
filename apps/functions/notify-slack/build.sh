#!/bin/bash

# Create output folder
mkdir -p build

# Create tarball for both shared and eslint packages
cd ../../../packages/shared/ || exit
pnpm install --no-frozen-lockfile
pnpm pack
cp devolunch-shared-1.0.0.tgz ../../apps/functions/notify-slack/devolunch-shared-1.0.0.tgz
cd ../eslint || exit
pnpm install --no-frozen-lockfile
pnpm pack
cp eslint-config-custom-1.0.0.tgz ../../apps/functions/notify-slack/eslint-config-custom-1.0.0.tgz

# Change devDependencies to point to the new tarball and include everything that's built into the zip
cd ../../apps/functions/notify-slack || exit
npm pkg set 'devDependencies.@devolunch/shared=file:devolunch-shared-1.0.0.tgz' 'devDependencies.eslint-config-custom=file:eslint-config-custom-1.0.0.tgz'
pnpm install --no-frozen-lockfile
npx make-dedicated-lockfile
pnpm compile
cp -R package.json pnpm-lock.yaml dist eslint-config-custom-1.0.0.tgz devolunch-shared-1.0.0.tgz build
npm pkg set 'devDependencies.@devolunch/shared=workspace:' 'devDependencies.eslint-config-custom=workspace:'

# Clean up
rm -f devolunch-shared-1.0.0.tgz
rm -f eslint-config-custom-1.0.0.tgz

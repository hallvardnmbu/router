#!/bin/sh
set -e

git submodule update --remote --merge

cd src/reinli
bun install
bunx vite build
cd ../..

bun run start

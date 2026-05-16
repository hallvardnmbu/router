#!/bin/sh
set -e

git submodule update --remote --merge

cd src/reinli
bun run build
cd ../..

bun run start

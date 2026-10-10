#!/usr/bin/env bash
set -euo pipefail

BUN="$HOME/.bun/bin/bun"
cd /var/www/router

"$BUN" upgrade

git pull --ff-only
git submodule update --init --remote --merge

cd src/reinli
"$BUN" install
"$BUN" run build
cd ../..

cd src/ferniss
"$BUN" install
"$BUN" run build
cd ../..

sudo systemctl restart router
sudo systemctl is-active router

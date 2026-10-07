#!/usr/bin/env bash
# Pull the latest code and submodules, rebuild, and restart the service.
# Run on the server, either by hand or via .github/workflows/deploy.yml.
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

sudo systemctl restart router
sudo systemctl is-active router

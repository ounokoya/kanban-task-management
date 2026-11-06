#!/usr/bin/env bash
# Construit le site et publie dist/ sur la branche gh-pages (GitHub Pages, ADR-0011).
# Usage : npm run deploy
set -euo pipefail

cd "$(dirname "$0")/.."
remote_url="$(git remote get-url origin)"
version="$(node -p "require('./package.json').version")"

npm run build
touch dist/.nojekyll

cd dist
rm -rf .git
git init -q -b gh-pages
git add -A
git commit -q -m "deploy: v${version} ($(git -C .. rev-parse --short HEAD))"
git push -q -f "$remote_url" gh-pages
rm -rf .git
echo "Publié : v${version} sur la branche gh-pages"

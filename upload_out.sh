#!/bin/bash
# 上传 out/ 目录到 GitHub Pages
set -e

REPO="allinnb/nb-zhongkao-recommender"
OUT_DIR="out"
BRANCH="gh-pages"
TMP_DIR=$(mktemp -d)

cp -r "$OUT_DIR"/* "$TMP_DIR/"

cd "$TMP_DIR"
git init
git config user.email "ci@nb-zhongkao.com" && git config user.name "CI"
touch .nojekyll
git add .
git commit -m "Deploy to GitHub Pages"
git remote add origin "https://${GITHUB_TOKEN}@github.com/${REPO}.git" 2>/dev/null || git remote set-url origin "https://${GITHUB_TOKEN}@github.com/${REPO}.git"
git fetch origin gh-pages 2>/dev/null || true
git checkout -b "$BRANCH"
git push origin "$BRANCH" --force
cd / && rm -rf "$TMP_DIR"
echo "Done"

#!/bin/bash

# Auto-push to GitHub
# Uses GITHUB_PAT environment variable

set -e

REPO_URL="https://${GITHUB_PAT}@github.com/$(git remote get-url origin | sed 's|https://github.com/||')"

git config user.email "cozyjet-agent@replit.com"
git config user.name "CozyJet Agent"

git add -A

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
MSG="${1:-"chore: auto-sync from Replit [$TIMESTAMP]"}"

git diff --cached --quiet && echo "Nothing to commit." && exit 0

git commit -m "$MSG"

# Push using PAT
ORIGIN=$(git remote get-url origin)
if [[ "$ORIGIN" == https://github.com/* ]]; then
  REPO_PATH="${ORIGIN#https://github.com/}"
  git push "https://${GITHUB_PAT}@github.com/${REPO_PATH}" HEAD:main
else
  git push origin HEAD:main
fi

echo "Pushed: $MSG"

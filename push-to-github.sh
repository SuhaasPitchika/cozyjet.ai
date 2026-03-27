#!/bin/bash
# Push all commits to GitHub using Personal Access Token

set -e

if [ -z "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN environment variable is not set."
  exit 1
fi

echo "Pushing to GitHub..."

git -C /home/runner/workspace \
  push "https://x-access-token:$(echo $GITHUB_PERSONAL_ACCESS_TOKEN | tr -d '\n\r ')@github.com/SuhaasPitchika/cozyjet.ai.git" HEAD:main

echo "Push complete!"

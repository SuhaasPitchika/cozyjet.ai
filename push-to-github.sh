#!/bin/bash
# Push all commits to GitHub using Personal Access Token

set -e

if [ -z "$GITHUB_PAT" ]; then
  echo "ERROR: GITHUB_PAT environment variable is not set."
  exit 1
fi

echo "Pushing to GitHub..."

git -C /home/runner/workspace \
  -c credential.helper="" \
  push "https://x-access-token:${GITHUB_PAT}@github.com/SuhaasPitchika/cozyjet.ai.git" HEAD:main

echo "Push complete!"

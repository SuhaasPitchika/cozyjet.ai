#!/bin/bash
set -e

if [ -z "$GH_PAT" ]; then
  echo "Error: GH_PAT secret not set"
  exit 1
fi

export GIT_TERMINAL_PROMPT=0

git push "https://x-access-token:${GH_PAT}@github.com/SuhaasPitchika/cozyjet.ai.git" HEAD:main
echo "Pushed to GitHub successfully"

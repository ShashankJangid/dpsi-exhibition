#!/usr/bin/env bash
# .github/maintainer/setup-labels.sh
# Provisions standard maintainer-bot labels on the target repository using GitHub CLI (`gh`).

set -euo pipefail

REPO="${1:-ShashankJangid/dpsi-exhibition}"
echo "Provisioning maintainer-bot labels on $REPO..."

LABELS=(
  "bot-suggests:merge|0e8a16|Bot suggests merging this PR"
  "bot-suggests:merge-with-fix|fbca04|Bot suggests merging after a minor mechanical fix"
  "bot-suggests:rework|d93f0b|Bot suggests author rework the changes"
  "bot-suggests:close|b60205|Bot suggests closing this PR"
  "bot-suggests:showcase|5319e7|Bot suggests showcasing in community showcase"
  "bot-suggests:addon|1d76db|Bot suggests packaging as a modular addon"
  "bot-suggests:theme|006b75|Bot suggests moving to themes"
  "needs-maintainer|e11d21|Requires maintainer human review"
  "bot-leans:merge|c2e0c6|Bot leans towards merge"
  "bot-leans:rework|fef2c0|Bot leans towards rework"
  "bot-leans:close|fad8c7|Bot leans towards close"
  "p0|b60205|Priority 0 - Urgent"
  "p1|d93f0b|Priority 1 - High"
  "p2|fbca04|Priority 2 - Medium"
  "p3|c5def5|Priority 3 - Low"
)

for entry in "${LABELS[@]}"; do
  IFS="|" read -r name color desc <<< "$entry"
  echo "Creating/updating label: $name ($color)"
  gh label create "$name" --color "$color" --description "$desc" --repo "$REPO" --force || true
done

echo "✅ All maintainer-bot labels provisioned successfully on $REPO!"

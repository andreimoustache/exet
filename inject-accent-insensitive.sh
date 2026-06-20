#!/usr/bin/env bash
#
# Inject the Romanian accent-insensitive patch into an exported Exolve puzzle.
#
# Exet exports a standalone Exolve HTML whose createExolve() call consults a
# global customizeExolve(p) if one exists. This script inlines the patch from
# accent-insensitive-ro.js into the exported file's <head> (before </head>),
# so the puzzle becomes accent-insensitive with no external file dependency.
#
# Usage: ./inject-accent-insensitive.sh path/to/exported-puzzle.html
#
set -euo pipefail
HTML="${1:?usage: inject-accent-insensitive.sh exported-puzzle.html}"
SNIPPET="$(dirname "$0")/accent-insensitive-ro.js"

if grep -q 'function customizeExolve' "$HTML"; then
  echo "Patch already present in $HTML — nothing to do."
  exit 0
fi

# Build the <script> block and insert it just before </head>.
{
  echo '<script>'
  cat "$SNIPPET"
  echo '</script>'
} > /tmp/_ai_block.html

# Insert before the first </head> (case-insensitive).
awk 'BEGIN{done=0}
     /<\/head>/ && !done { while((getline l < "/tmp/_ai_block.html")>0) print l; done=1 }
     { print }' "$HTML" > "$HTML.tmp" && mv "$HTML.tmp" "$HTML"
rm -f /tmp/_ai_block.html
echo "Injected accent-insensitive patch into $HTML"

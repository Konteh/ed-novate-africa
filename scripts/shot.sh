#!/usr/bin/env bash
# Headless screenshot helper for local prototype review.
# Usage: scripts/shot.sh <path> <out.png> [width] [height]
set -uo pipefail

PATH_PART="${1:-/}"
OUT="${2:-/tmp/shot.png}"
W="${3:-1440}"
H="${4:-900}"
PORT="${PORT:-43127}"
WAIT="${WAIT:-12}"
PROFILE="$(mktemp -d)"

rm -f "$OUT"

google-chrome \
  --headless=new \
  --no-sandbox \
  --disable-gpu \
  --disable-dev-shm-usage \
  --hide-scrollbars \
  --force-device-scale-factor=1 \
  --user-data-dir="$PROFILE" \
  --window-size="${W},${H}" \
  --screenshot="$OUT" \
  --virtual-time-budget=5000 \
  "http://127.0.0.1:${PORT}${PATH_PART}" >/dev/null 2>&1 &
CHROME_PID=$!

for _ in $(seq 1 "$WAIT"); do
  [ -s "$OUT" ] && break
  sleep 1
done
sleep 1
kill -9 "$CHROME_PID" 2>/dev/null
pkill -9 -f "$PROFILE" 2>/dev/null
rm -rf "$PROFILE"

ls -la "$OUT" 2>/dev/null || echo "FAILED: no screenshot produced"

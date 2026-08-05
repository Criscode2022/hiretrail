#!/bin/sh
set -eu
cd /workspace

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/api/health; then
  exit 0
fi

mkdir -p /workspace/data /tmp
export PORT="${PORT:-8080}"
export HOST="${HOST:-0.0.0.0}"
export JWT_SECRET="${JWT_SECRET:-hiretrail-dev-secret-change-me}"
export SQLITE_PATH="${SQLITE_PATH:-/workspace/data/hiretrail.sqlite}"

# Ensure production builds exist
if [ ! -f apps/web/dist/web/browser/index.html ] && [ ! -f apps/web/dist/web/index.html ]; then
  npm run build --workspace=apps/web >>/tmp/app-startup.log 2>&1 || true
fi
if [ ! -f apps/api/dist/main.js ]; then
  npm run build --workspace=apps/api >>/tmp/app-startup.log 2>&1 || true
fi

if [ -f apps/api/dist/main.js ]; then
  node apps/api/dist/main.js >>/tmp/app-startup.log 2>&1 &
else
  npm run start:dev --workspace=apps/api >>/tmp/app-startup.log 2>&1 &
fi

i=0
while [ "$i" -lt 60 ]; do
  if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/api/health; then
    exit 0
  fi
  i=$((i + 1))
  sleep 1
done
exit 1

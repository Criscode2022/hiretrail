#!/bin/sh
set -eu
cd /workspace

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/api/health; then
  exit 0
fi

# Ensure web build exists for Nest static serving
if [ ! -f apps/web/dist/web/browser/index.html ] && [ ! -f apps/web/dist/web/index.html ]; then
  npm run build --workspace=apps/web >>/tmp/app-startup.log 2>&1 || true
fi

mkdir -p /workspace/data /workspace/apps/api/data /tmp
export PORT=8080
export HOST=0.0.0.0
export NODE_ENV="${NODE_ENV:-development}"
export JWT_SECRET="${JWT_SECRET:-hiretrail-dev-secret-change-me}"

# Prefer compiled API if present, else watch/dev
if [ -f apps/api/dist/main.js ]; then
  node apps/api/dist/main.js >>/tmp/app-startup.log 2>&1 &
else
  npm run start:dev --workspace=apps/api >>/tmp/app-startup.log 2>&1 &
fi

# Wait briefly for health
i=0
while [ "$i" -lt 60 ]; do
  if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/api/health; then
    exit 0
  fi
  i=$((i + 1))
  sleep 1
done
exit 1

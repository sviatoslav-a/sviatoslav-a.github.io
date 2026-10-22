#!/bin/sh
set -eu
APP_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$APP_ROOT"
if [ "${1:-}" = "--https" ]; then
  shift
  exec docker compose --env-file .env -f deploy/upstream/docker-compose.yml -f deploy/quiet.yml -f deploy/https.yml "$@"
fi
exec docker compose --env-file .env -f deploy/upstream/docker-compose.yml -f deploy/quiet.yml "$@"

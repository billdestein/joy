#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

CONFIG_FILE="$HOME/lucy-config/FrontendLocalConfig.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "Config file not found: $CONFIG_FILE"
  exit 1
fi

export VITE_COGNITO_AUTHORITY="$(jq -r '.COGNITO_AUTHORITY' "$CONFIG_FILE")"
export VITE_COGNITO_CLIENT_ID="$(jq -r '.COGNITO_CLIENT_ID' "$CONFIG_FILE")"

cd "$SCRIPT_DIR"
npm run dev

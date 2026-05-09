#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

CONFIG_FILE=~/lucy-config/FrontendLocalConfig.json
CONFIG=$(cat "$CONFIG_FILE")

export VITE_COGNITO_AUTHORITY=$(echo "$CONFIG" | jq -r '.COGNITO_AUTHORITY')
export VITE_COGNITO_CLIENT_ID=$(echo "$CONFIG" | jq -r '.COGNITO_CLIENT_ID')

npx vite

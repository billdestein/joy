#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Build common package first
cd "$SCRIPT_DIR/../common"
npm run build
cd "$SCRIPT_DIR"

MODE="${1:-local}"

if [ "$MODE" = "prod" ]; then
  CONFIG_FILE=~/lucy-config/BackendProdConfig.json
else
  CONFIG_FILE=~/lucy-config/BackendLocalConfig.json
fi

CONFIG=$(cat "$CONFIG_FILE")

export COGNITO_REGION=$(echo "$CONFIG" | jq -r '.COGNITO_REGION')
export COGNITO_USER_POOL_ID=$(echo "$CONFIG" | jq -r '.COGNITO_USER_POOL_ID')
export GOOGLE_API_KEY=$(echo "$CONFIG" | jq -r '.GOOGLE_API_KEY')
export MOUNT_DIR=$(echo "$CONFIG" | jq -r '.MOUNT_DIR')
export ORIGIN=$(echo "$CONFIG" | jq -r '.ORIGIN')
export REDIS_HOST=$(echo "$CONFIG" | jq -r '.REDIS_HOST')
export REDIS_PORT=$(echo "$CONFIG" | jq -r '.REDIS_PORT')

npx ts-node src/index.ts

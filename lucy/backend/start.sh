#!/bin/bash
set -e

CONFIG_FILE="$HOME/lucy-config/BackendLocalConfig.json"
if [ "${NODE_ENV}" = "production" ]; then
    CONFIG_FILE="$HOME/lucy-config/BackendProdConfig.json"
fi

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Config file not found: $CONFIG_FILE"
    exit 1
fi

(cd "$(dirname "$0")/../common" && npm run build)

export COGNITO_REGION=$(jq -r '.COGNITO_REGION' "$CONFIG_FILE")
export COGNITO_USER_POOL_ID=$(jq -r '.COGNITO_USER_POOL_ID' "$CONFIG_FILE")
export GOOGLE_API_KEY=$(jq -r '.GOOGLE_API_KEY' "$CONFIG_FILE")
export MOUNT_DIR=$(jq -r '.MOUNT_DIR' "$CONFIG_FILE")
export ORIGIN=$(jq -r '.ORIGIN' "$CONFIG_FILE")
export REDIS_HOST=$(jq -r '.REDIS_HOST' "$CONFIG_FILE")
export REDIS_PORT=$(jq -r '.REDIS_PORT' "$CONFIG_FILE")

npx ts-node src/index.ts

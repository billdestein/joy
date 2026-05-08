#!/bin/bash
set -e

MODE=${1:-local}
if [ "$MODE" = "prod" ]; then
    CONFIG_FILE=~/lucy-config/BackendProdConfig.json
else
    CONFIG_FILE=~/lucy-config/BackendLocalConfig.json
fi

export COGNITO_REGION=$(jq -r '.COGNITO_REGION' "$CONFIG_FILE")
export COGNITO_USER_POOL_ID=$(jq -r '.COGNITO_USER_POOL_ID' "$CONFIG_FILE")
export GOOGLE_API_KEY=$(jq -r '.GOOGLE_API_KEY' "$CONFIG_FILE")
export MOUNT_DIR=$(jq -r '.MOUNT_DIR' "$CONFIG_FILE")
export ORIGIN=$(jq -r '.ORIGIN' "$CONFIG_FILE")
export REDIS_HOST=$(jq -r '.REDIS_HOST' "$CONFIG_FILE")
export REDIS_PORT=$(jq -r '.REDIS_PORT' "$CONFIG_FILE")

npm run dev

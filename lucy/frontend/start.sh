#!/bin/bash
set -e

CONFIG_FILE="$HOME/lucy-config/FrontendLocalConfig.json"

export VITE_COGNITO_AUTHORITY=$(jq -r '.COGNITO_AUTHORITY' "$CONFIG_FILE")
export VITE_COGNITO_CLIENT_ID=$(jq -r '.COGNITO_CLIENT_ID' "$CONFIG_FILE")

npm run dev

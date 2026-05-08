#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$HOME/lucy-config/FrontendLocalConfig.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Config file not found: $CONFIG_FILE"
    exit 1
fi

export $(node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
console.log(Object.entries(config).map(([k, v]) => 'VITE_' + k + '=' + v).join(' '));
")

cd "$SCRIPT_DIR"
npm run dev

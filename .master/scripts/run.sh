#!/usr/bin/env bash

# Formula 1 Project - Local Build & Runner Script
# Builds TypeScript assets, checks lints, and opens the app in the default browser.

set -e

echo "=========================================="
echo "🏎️  FORMULA 1 2026 - LOCAL BUILD & RUN"
echo "=========================================="

echo "📦 Step 1: Building production bundle..."
npm run build

echo "🔍 Step 2: Validating SOP governance..."
npm run sop:validate

echo "🚀 Step 3: Launching local preview server..."
open "http://localhost:5173" || open "http://localhost:4173" || true
npx vite preview --host 0.0.0.0 --port 5173

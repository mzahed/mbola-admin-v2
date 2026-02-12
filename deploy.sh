#!/bin/bash

# DreamHost Deployment Script
# Usage: ./deploy.sh [username@hostname]

set -e

# Configuration
REMOTE_USER=${1:-"yourusername@mbola.org"}
REMOTE_PATH="~/mbola.org/admin-v2"
BUILD_DIR="out"

echo "🚀 Starting deployment to DreamHost..."

# Step 1: Build the app
echo "📦 Building Next.js app..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ Build failed - 'out' directory not found"
    exit 1
fi

echo "✅ Build successful"

# Step 2: Upload files
echo "📤 Uploading files to DreamHost..."
rsync -avz --delete \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.next' \
    "$BUILD_DIR/" "$REMOTE_USER:$REMOTE_PATH/"

# Step 3: Upload .htaccess
echo "📄 Uploading .htaccess..."
scp .htaccess "$REMOTE_USER:$REMOTE_PATH/.htaccess"

echo "✅ Deployment complete!"
echo "🌐 Visit: https://mbola.org/admin-v2/"

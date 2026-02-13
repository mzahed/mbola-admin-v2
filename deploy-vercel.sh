#!/bin/bash

# Vercel Deployment Script
# This script helps deploy to Vercel with proper scope handling

cd "$(dirname "$0")"

echo "🚀 Deploying MBOLA Admin V2 to Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in
echo "Checking authentication..."
vercel whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Not logged in. Please run: vercel login"
    exit 1
fi

echo "✅ Authenticated as: $(vercel whoami)"
echo ""

# Try to deploy with scope
echo "Attempting deployment..."
echo ""

# First, try to link the project
echo "Linking project..."
vercel link --scope mohammeds-projects-859edd09 <<EOF

mbola-admin-v2
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Project linked successfully!"
    echo ""
    echo "Deploying to production..."
    vercel --prod
else
    echo ""
    echo "⚠️  Link failed, trying direct deployment..."
    echo ""
    echo "Please run this command manually:"
    echo "  vercel --prod --scope mohammeds-projects-859edd09"
    echo ""
    echo "Or use the Vercel Dashboard: https://vercel.com/new"
fi

#!/bin/bash
set -e

echo "🥏  Disc Golf Dashboard — Cloudflare Pages Deploy"
echo "=================================================="

# Check if wrangler is available
if ! npx wrangler --version > /dev/null 2>&1; then
  echo "❌ Wrangler not found. Installing..."
  npm install
fi

# Check if logged in to Cloudflare
echo "🔑 Checking Cloudflare authentication..."
if ! npx wrangler whoami > /dev/null 2>&1; then
  echo "Please log in to Cloudflare:"
  npx wrangler login
fi

# Build
echo "🔨 Building..."
npm run build

# Deploy
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=discgolf-dashboard

echo ""
echo "✅ Deployed! Your dashboard should be live at:"
echo "   https://discgolf-dashboard.pages.dev"
echo ""
echo "🔐 Make sure ANTHROPIC_API_KEY is set in Cloudflare Pages project settings."
echo ""
echo "📸 Add player avatars to /public/avatars/ with filenames like:"
echo "   firstname-lastname.jpg  (lowercase, spaces as dashes)"

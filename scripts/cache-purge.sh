#!/bin/bash

# Emergency Cache Purge Script
# Use when normal deployment doesn't resolve cache issues

set -e

echo "🔥 EMERGENCY CACHE PURGE INITIATED..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Generate cache-busting parameter
CACHE_BUST=$(date +%s)

echo -e "${YELLOW}🧹 Purging all cached content...${NC}"

# Update vercel.json with cache-busting headers
cat > vercel-emergency.json << EOF
{
  "projectSettings": {
    "framework": "nextjs"
  },
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0"
        },
        {
          "key": "Pragma",
          "value": "no-cache"
        },
        {
          "key": "Expires",
          "value": "0"
        },
        {
          "key": "X-Cache-Bust",
          "value": "$CACHE_BUST"
        }
      ]
    }
  ],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "env": {
    "NODE_ENV": "production",
    "CACHE_BUST": "$CACHE_BUST"
  }
}
EOF

# Backup original config
cp vercel.json vercel.json.backup

# Use emergency config
mv vercel-emergency.json vercel.json

echo -e "${YELLOW}🚀 Deploying with emergency cache-busting...${NC}"

# Clean everything
rm -rf .next
rm -rf node_modules/.cache

# Fresh install and deploy
npm ci
vercel --prod --force

# Wait a moment for deployment
sleep 5

# Restore original config
mv vercel.json.backup vercel.json

# Deploy again with normal config
echo -e "${YELLOW}🔄 Deploying with normal cache settings...${NC}"
vercel --prod --force

# Test the deployment
echo -e "${YELLOW}🔍 Testing deployment...${NC}"
if curl -f -s -H "Cache-Control: no-cache" "https://ebay-profit-dashboard.vercel.app?cb=$CACHE_BUST" > /dev/null; then
    echo -e "${GREEN}✅ Emergency cache purge successful!${NC}"
else
    echo -e "${RED}❌ Cache purge may need more time. Try again in 5-10 minutes.${NC}"
fi

echo -e "${BLUE}📝 User should now:${NC}"
echo -e "   1. Hard refresh browser (Ctrl+Shift+R)"
echo -e "   2. Clear browser data completely"
echo -e "   3. Flush DNS cache"
echo -e "   4. Try incognito/private mode"
echo -e "   5. Test: https://ebay-profit-dashboard.vercel.app?cb=$CACHE_BUST"

rm -f vercel-emergency.json
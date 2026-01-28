#!/bin/bash

# Clean Deployment Script for eBay Profit Dashboard
# Fixes CDN cache pollution from failed deployments

set -e

echo "🚨 Starting CLEAN deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_ID="prj_MJY9ehKdZYNFLcrACesjEaWA48qp"
PROJECT_NAME="ebay-profit-dashboard"

echo -e "${BLUE}📋 Project: $PROJECT_NAME${NC}"
echo -e "${BLUE}📋 ID: $PROJECT_ID${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Login check
echo -e "${YELLOW}🔐 Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with Vercel. Please run 'vercel login' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Authenticated with Vercel${NC}"

# Clean build
echo -e "${YELLOW}🧹 Cleaning previous build artifacts...${NC}"
rm -rf .next
rm -rf node_modules/.cache

# Fresh dependency install
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci

# Type check
echo -e "${YELLOW}🔍 Running type check...${NC}"
npm run type-check

# Lint check (skip for emergency deployment)
echo -e "${YELLOW}⚠️  Skipping lint check for emergency deployment...${NC}"
# npm run lint

# Build
echo -e "${YELLOW}🏗️ Building application...${NC}"
npm run build

# Deploy with cache purge
echo -e "${YELLOW}🚀 Deploying to production with cache invalidation...${NC}"
vercel --prod --force

# Get the deployment URL
DEPLOYMENT_URL=$(vercel list --limit 1 --scope team_T7PLQTT1I5rqw7HUWS1cdsQl | grep "https://" | awk '{print $1}' | head -n 1)

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Production URL: https://ebay-profit-dashboard.vercel.app${NC}"
echo -e "${GREEN}🌐 Direct URL: $DEPLOYMENT_URL${NC}"

# Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"
if curl -f -s "https://ebay-profit-dashboard.vercel.app" > /dev/null; then
    echo -e "${GREEN}✅ Production URL is responding${NC}"
else
    echo -e "${RED}❌ Production URL is not responding${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Clean deployment completed successfully!${NC}"
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "   1. Test from your location: https://ebay-profit-dashboard.vercel.app"
echo -e "   2. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo -e "   3. Flush your local DNS cache"
echo -e "   4. Try from different network if issues persist"

# DNS cache flush instructions
echo -e "${YELLOW}💡 DNS Cache Flush Instructions:${NC}"
echo -e "   Windows: ipconfig /flushdns"
echo -e "   macOS: sudo dscacheutil -flushcache"
echo -e "   Linux: sudo systemctl restart systemd-resolved"
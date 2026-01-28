#!/bin/bash

# Staging Deployment Script for eBay Profit Dashboard
# Safe testing environment before production

set -e

echo "🧪 Starting STAGING deployment process..."

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
echo -e "${BLUE}📋 Environment: STAGING${NC}"

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

# Lint check
echo -e "${YELLOW}🔍 Running lint check...${NC}"
npm run lint

# Build
echo -e "${YELLOW}🏗️ Building application...${NC}"
npm run build

# Deploy to staging (preview)
echo -e "${YELLOW}🚀 Deploying to staging environment...${NC}"
# Use the staging configuration
cp vercel-staging.json vercel.json.backup
mv vercel-staging.json vercel.json

vercel --force

# Restore original config
mv vercel.json.backup vercel.json

# Get the staging deployment URL
STAGING_URL=$(vercel list --limit 1 --scope team_T7PLQTT1I5rqw7HUWS1cdsQl | grep "https://" | awk '{print $1}' | head -n 1)

echo -e "${GREEN}✅ Staging deployment successful!${NC}"
echo -e "${GREEN}🧪 Staging URL: $STAGING_URL${NC}"

# Verify staging deployment
echo -e "${YELLOW}🔍 Verifying staging deployment...${NC}"
if curl -f -s "$STAGING_URL" > /dev/null; then
    echo -e "${GREEN}✅ Staging URL is responding${NC}"
else
    echo -e "${RED}❌ Staging URL is not responding${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Staging deployment completed successfully!${NC}"
echo -e "${BLUE}📝 Test the staging environment:${NC}"
echo -e "   🧪 Staging URL: $STAGING_URL"
echo -e "   ✅ If tests pass, run: ./scripts/deploy-clean.sh"
echo -e "   ❌ If issues found, fix and redeploy to staging first"
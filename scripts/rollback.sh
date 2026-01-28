#!/bin/bash

# Emergency Rollback Script for eBay Profit Dashboard
# Use when current deployment is broken and needs immediate rollback

set -e

echo "🔄 EMERGENCY ROLLBACK INITIATED..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Project configuration
PROJECT_ID="prj_MJY9ehKdZYNFLcrACesjEaWA48qp"

echo -e "${BLUE}📋 Rolling back eBay Profit Dashboard...${NC}"

# Check authentication
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with Vercel. Please run 'vercel login' first.${NC}"
    exit 1
fi

# List recent deployments
echo -e "${YELLOW}📋 Fetching recent deployments...${NC}"
vercel list --scope team_T7PLQTT1I5rqw7HUWS1cdsQl --limit 5

echo -e "${YELLOW}🔍 Finding last stable deployment...${NC}"

# Get the last successful production deployment (excluding the current one)
DEPLOYMENTS=$(vercel list --scope team_T7PLQTT1I5rqw7HUWS1cdsQl --limit 10 --format json)
LAST_STABLE=""

# Find the most recent ready deployment that's not the current one
for deployment in $(echo "$DEPLOYMENTS" | jq -r '.[] | select(.state == "READY") | .url' | head -5); do
    echo -e "${BLUE}🔍 Checking deployment: $deployment${NC}"
    
    # Test if deployment is accessible
    if curl -f -s "https://$deployment" > /dev/null; then
        LAST_STABLE="https://$deployment"
        echo -e "${GREEN}✅ Found stable deployment: $LAST_STABLE${NC}"
        break
    fi
done

if [ -z "$LAST_STABLE" ]; then
    echo -e "${RED}❌ No stable deployment found. Manual intervention required.${NC}"
    echo -e "${YELLOW}💡 Try the emergency cache purge instead: ./scripts/cache-purge.sh${NC}"
    exit 1
fi

# Confirm rollback
echo -e "${YELLOW}⚠️  About to rollback to: $LAST_STABLE${NC}"
echo -e "${YELLOW}⚠️  This will make it the new production deployment.${NC}"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}ℹ️  Rollback cancelled.${NC}"
    exit 0
fi

# Perform rollback
echo -e "${YELLOW}🔄 Rolling back to stable deployment...${NC}"
if vercel promote "$LAST_STABLE" --scope team_T7PLQTT1I5rqw7HUWS1cdsQl; then
    echo -e "${GREEN}✅ Rollback successful!${NC}"
    echo -e "${GREEN}🌐 Production URL: https://ebay-profit-dashboard.vercel.app${NC}"
    echo -e "${GREEN}🌐 Rolled back to: $LAST_STABLE${NC}"
else
    echo -e "${RED}❌ Rollback failed. Manual intervention required.${NC}"
    echo -e "${YELLOW}💡 Contact Vercel support with project ID: $PROJECT_ID${NC}"
    exit 1
fi

# Verify rollback
echo -e "${YELLOW}🔍 Verifying rollback...${NC}"
sleep 10  # Wait for propagation

if curl -f -s "https://ebay-profit-dashboard.vercel.app" > /dev/null; then
    echo -e "${GREEN}✅ Rollback verification successful!${NC}"
    echo -e "${BLUE}📝 Next steps:${NC}"
    echo -e "   1. Test the application: https://ebay-profit-dashboard.vercel.app"
    echo -e "   2. Inform user that the issue is resolved"
    echo -e "   3. Investigate what caused the deployment failure"
    echo -e "   4. Fix the issue before next deployment"
    echo -e "   5. Always test in staging first: ./scripts/deploy-staging.sh"
else
    echo -e "${RED}❌ Rollback verification failed.${NC}"
    echo -e "${YELLOW}💡 May need time for CDN propagation (5-10 minutes)${NC}"
    echo -e "${YELLOW}💡 Or try emergency cache purge: ./scripts/cache-purge.sh${NC}"
fi

echo -e "${GREEN}🎉 Rollback process completed.${NC}"
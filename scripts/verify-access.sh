#!/bin/bash

# User Access Verification Script
# Tests if the eBay Profit Dashboard is accessible from user's perspective

set -e

echo "🔍 VERIFYING USER ACCESS..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

MAIN_URL="https://ebay-profit-dashboard.vercel.app"

echo -e "${BLUE}🌐 Testing: $MAIN_URL${NC}"

# Test 1: Basic connectivity
echo -e "${YELLOW}Test 1: Basic connectivity...${NC}"
if curl -f -s --max-time 10 "$MAIN_URL" > /dev/null; then
    echo -e "${GREEN}✅ Basic connectivity: PASS${NC}"
else
    echo -e "${RED}❌ Basic connectivity: FAIL${NC}"
    echo -e "${YELLOW}💡 This indicates CDN cache pollution or DNS issues${NC}"
fi

# Test 2: HTTP headers
echo -e "${YELLOW}Test 2: HTTP response headers...${NC}"
HEADERS=$(curl -I -s --max-time 10 "$MAIN_URL" | head -20)
STATUS=$(echo "$HEADERS" | head -1 | grep -o '[0-9]\{3\}')
echo -e "${BLUE}Status Code: $STATUS${NC}"

if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ HTTP Status: PASS${NC}"
elif [ "$STATUS" = "502" ] || [ "$STATUS" = "503" ] || [ "$STATUS" = "504" ]; then
    echo -e "${RED}❌ HTTP Status: FAIL (Server Error)${NC}"
    echo -e "${YELLOW}💡 This indicates CDN cache pollution${NC}"
elif [ "$STATUS" = "404" ]; then
    echo -e "${RED}❌ HTTP Status: FAIL (Not Found)${NC}"
    echo -e "${YELLOW}💡 This indicates routing issues${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP Status: UNKNOWN ($STATUS)${NC}"
fi

# Test 3: Content check
echo -e "${YELLOW}Test 3: Content verification...${NC}"
CONTENT=$(curl -f -s --max-time 10 "$MAIN_URL" | head -50)
if echo "$CONTENT" | grep -qi "dealflow\|ebay\|profit\|dashboard"; then
    echo -e "${GREEN}✅ Content check: PASS${NC}"
else
    echo -e "${RED}❌ Content check: FAIL${NC}"
    echo -e "${YELLOW}💡 Page exists but content is wrong${NC}"
fi

# Test 4: DNS resolution
echo -e "${YELLOW}Test 4: DNS resolution...${NC}"
if nslookup ebay-profit-dashboard.vercel.app > /dev/null 2>&1; then
    echo -e "${GREEN}✅ DNS resolution: PASS${NC}"
else
    echo -e "${RED}❌ DNS resolution: FAIL${NC}"
    echo -e "${YELLOW}💡 DNS cache issues detected${NC}"
fi

# Test 5: Alternative access methods
echo -e "${YELLOW}Test 5: Cache-busting access...${NC}"
CACHE_BUST=$(date +%s)
if curl -f -s --max-time 10 -H "Cache-Control: no-cache" "$MAIN_URL?cb=$CACHE_BUST" > /dev/null; then
    echo -e "${GREEN}✅ Cache-busting access: PASS${NC}"
else
    echo -e "${RED}❌ Cache-busting access: FAIL${NC}"
fi

echo -e "${BLUE}📋 SUMMARY:${NC}"
echo -e "${YELLOW}If tests are passing:${NC}"
echo -e "   • The app is working globally"
echo -e "   • User needs to clear local cache/DNS"
echo -e "   • Issue is client-side caching"

echo -e "${YELLOW}If tests are failing:${NC}"
echo -e "   • CDN cache pollution confirmed"
echo -e "   • Run emergency cache purge: ./scripts/cache-purge.sh"
echo -e "   • Or rollback: ./scripts/rollback.sh"

echo -e "${BLUE}🔧 User instructions:${NC}"
echo -e "1. Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)"
echo -e "2. Clear browser data completely"
echo -e "3. Flush DNS cache:"
echo -e "   Windows: ipconfig /flushdns"
echo -e "   macOS: sudo dscacheutil -flushcache"
echo -e "   Linux: sudo systemctl restart systemd-resolved"
echo -e "4. Try incognito/private browsing"
echo -e "5. Test from different network (mobile data)"
echo -e "6. Test direct URL: $MAIN_URL?cb=$CACHE_BUST"
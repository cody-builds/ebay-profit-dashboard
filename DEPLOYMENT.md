# eBay Profit Dashboard - Deployment Guide

## 🚨 CDN Cache Pollution Prevention

This guide prevents the cache pollution issues caused by multiple failed deployments.

## Quick Fix for Current Issue

**IMMEDIATE SOLUTION:**
```bash
cd projects/ebay-profit-dashboard
./scripts/deploy-clean.sh
```

**User Instructions:**
1. Clear browser cache: `Ctrl+Shift+R` (Chrome/Edge) or `Cmd+Shift+R` (Safari)
2. Flush DNS cache:
   - **Windows:** `ipconfig /flushdns`
   - **macOS:** `sudo dscacheutil -flushcache`
   - **Linux:** `sudo systemctl restart systemd-resolved`
3. Try different network (mobile hotspot) if issues persist
4. Test direct deployment URL if provided

---

## Proper Deployment Workflow

### 1. Development Phase
```bash
npm run dev          # Local development
npm run type-check   # Type checking
npm run lint        # Code linting
npm run test        # Run tests (when available)
```

### 2. Staging Deployment
```bash
./scripts/deploy-staging.sh
```
- Creates preview deployment
- Safe testing environment
- No impact on production
- Full functionality testing

### 3. Production Deployment (Only after staging verification)
```bash
./scripts/deploy-clean.sh
```
- Cleans cache pollution
- Forces fresh deployment
- Invalidates CDN cache
- Verifies deployment success

---

## Deployment Scripts

### `./scripts/deploy-staging.sh`
- **Purpose:** Safe testing before production
- **Output:** Preview URL for testing
- **Cache:** Aggressive no-cache headers for testing
- **Use:** Every feature/bug fix before production

### `./scripts/deploy-clean.sh`
- **Purpose:** Production deployment with cache invalidation
- **Output:** Clean production deployment
- **Cache:** Proper production cache headers
- **Use:** Only after staging verification

---

## Cache Strategy

### Development/Staging
- `Cache-Control: no-cache, no-store, must-revalidate`
- Forces fresh content on every request
- Perfect for testing changes

### Production
- `Cache-Control: public, max-age=31536000, immutable` (static assets)
- `Cache-Control: s-maxage=60, stale-while-revalidate` (API routes)
- `Cache-Control: public, max-age=0, must-revalidate` (HTML pages)

---

## Troubleshooting Cache Issues

### User Experiencing Connection Issues

1. **Immediate Fix:**
   ```bash
   ./scripts/deploy-clean.sh
   ```

2. **User Instructions:**
   - Clear browser cache completely
   - Flush DNS cache (OS-specific commands above)
   - Try incognito/private browsing mode
   - Test from different network (mobile data)
   - Try different browser

3. **Verify Fix:**
   ```bash
   # Test from command line
   curl -I https://ebay-profit-dashboard.vercel.app
   # Should return 200 OK
   ```

### Failed Deployment Recovery

1. **Check Current Status:**
   ```bash
   vercel list --scope team_T7PLQTT1I5rqw7HUWS1cdsQl
   ```

2. **Clean Deploy:**
   ```bash
   rm -rf .next node_modules/.cache
   ./scripts/deploy-clean.sh
   ```

3. **Rollback if Needed:**
   ```bash
   vercel rollback [deployment-url] --prod
   ```

---

## Prevention Best Practices

### Before Every Deployment
1. ✅ Test locally (`npm run dev`)
2. ✅ Run type check (`npm run type-check`)
3. ✅ Run linting (`npm run lint`)
4. ✅ Deploy to staging first (`./scripts/deploy-staging.sh`)
5. ✅ Test staging deployment thoroughly
6. ✅ Only then deploy to production (`./scripts/deploy-clean.sh`)

### Avoid These Mistakes
- ❌ Never deploy directly to production without staging
- ❌ Don't deploy with TypeScript errors
- ❌ Don't deploy with lint failures
- ❌ Don't ignore staging test failures
- ❌ Don't deploy multiple times quickly (causes cache pollution)

---

## Emergency Procedures

### Complete Cache Purge
```bash
# If normal deployment doesn't work
vercel secrets add cache-purge-key $(openssl rand -hex 16)
./scripts/deploy-clean.sh
```

### DNS Issues
```bash
# Check DNS propagation
nslookup ebay-profit-dashboard.vercel.app
dig ebay-profit-dashboard.vercel.app

# Alternative access via direct deployment URL
vercel list --limit 1 | grep https://
```

### Vercel Platform Issues
```bash
# Check Vercel status
curl -s https://www.vercel-status.com/api/v2/status.json

# Alternative deployment
vercel --force --debug
```

---

## Monitoring & Alerts

### Health Checks
- Production URL: https://ebay-profit-dashboard.vercel.app
- Expected response: 200 OK with "DealFlow" title
- Monitor every 5 minutes

### Error Indicators
- HTTP 502/503: CDN cache pollution
- DNS resolution errors: Regional cache issues
- Connection timeouts: Network routing problems

### Recovery Actions
1. Run `./scripts/deploy-clean.sh`
2. Wait 5-10 minutes for propagation
3. If persists, contact Vercel support

---

## Support Information

- **Project ID:** `prj_MJY9ehKdZYNFLcrACesjEaWA48qp`
- **Team:** `team_T7PLQTT1I5rqw7HUWS1cdsQl`
- **Production URL:** https://ebay-profit-dashboard.vercel.app
- **Framework:** Next.js 14.2.35
- **Deployment:** Vercel

## Contact
For deployment issues, run the diagnostic scripts and provide output to support.
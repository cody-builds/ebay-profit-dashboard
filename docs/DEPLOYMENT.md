# DealFlow Deployment Guide

This guide covers the complete deployment process for the DealFlow application using Vercel with GitHub Actions CI/CD.

## Overview

- **Framework**: Next.js 14 (App Router)
- **Deployment Platform**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics + Lighthouse CI
- **Environment Management**: Vercel Environment Variables

## Prerequisites

1. **GitHub Repository**: Push code to GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Vercel CLI**: Install globally: `npm install -g vercel`

## Quick Deployment

### 1. Vercel Setup

```bash
# Login to Vercel
vercel login

# Initialize project (run in project directory)
vercel

# Follow the prompts:
# - Link to existing project? N
# - Project name: dealflow-app
# - Directory: ./
# - Override settings? N
```

### 2. Environment Variables

Set up environment variables in Vercel dashboard:

```bash
# Production Environment
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=DealFlow
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### 3. GitHub Integration

1. Connect your GitHub repository in Vercel dashboard
2. Enable automatic deployments from `main` branch
3. Set up preview deployments for pull requests

## Detailed Setup

### GitHub Repository Setup

1. **Create Repository**:
```bash
gh repo create dealflow-app --public --description "Pokemon Card Arbitrage Tool"
git remote add origin https://github.com/YOUR_USERNAME/dealflow-app.git
```

2. **Set Repository Secrets**:
```bash
# In GitHub repository settings > Secrets and variables > Actions
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
LHCI_GITHUB_APP_TOKEN=lighthouse_token (optional)
```

3. **Get Vercel Tokens**:
```bash
# Get Vercel token
vercel login
# Go to https://vercel.com/account/tokens

# Get org and project IDs
vercel project ls
```

### Environment Configuration

#### Development (.env.local)
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### Staging/Preview
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://dealflow-git-develop.vercel.app
NEXT_PUBLIC_ENABLE_DEMO_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### Production
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://dealflow.vercel.app
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
VERCEL_ANALYTICS_ID=your_analytics_id
```

## Deployment Workflow

### Automatic Deployments

1. **Production Deployment**:
   - Push to `main` branch
   - GitHub Actions runs tests
   - Automatic deployment to production
   - Domain: `https://dealflow.vercel.app`

2. **Preview Deployment**:
   - Create pull request
   - GitHub Actions runs tests
   - Automatic preview deployment
   - Domain: `https://dealflow-git-pr-123.vercel.app`

### Manual Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Performance Monitoring

### Lighthouse CI

Automatically runs on every pull request:
- Performance score target: 80+
- Accessibility score target: 90+
- Best practices score target: 85+
- SEO score target: 80+

### Vercel Analytics

Enable in production:
1. Install Vercel Analytics: `npm install @vercel/analytics`
2. Set `NEXT_PUBLIC_ENABLE_ANALYTICS=true`
3. Add analytics ID to environment variables

## Domain Configuration

### Custom Domain Setup

1. **Add Domain in Vercel**:
   - Go to Project Settings > Domains
   - Add your custom domain
   - Configure DNS records

2. **DNS Configuration**:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

### SSL Certificate

Vercel automatically provides SSL certificates for all domains.

## Monitoring & Maintenance

### Health Checks

The application includes health check endpoints:
- `/api/health` - Basic health check
- `/api/status` - Detailed system status

### Logs

Access deployment logs:
```bash
# View function logs
vercel logs https://dealflow.vercel.app

# Real-time logs
vercel logs --follow
```

### Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check TypeScript errors: `npm run type-check`
   - Check lint errors: `npm run lint`
   - Verify all dependencies: `npm install`

2. **Environment Variable Issues**:
   - Ensure all required variables are set
   - Check variable names (case-sensitive)
   - Redeploy after changing environment variables

3. **Performance Issues**:
   - Analyze bundle size: `npm run analyze`
   - Check Lighthouse scores
   - Optimize images and assets

### Getting Help

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Actions**: [docs.github.com/actions](https://docs.github.com/en/actions)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **Content Security Policy**: Configured in `vercel.json`
3. **Security Headers**: Implemented for all routes
4. **Dependency Scanning**: Automated with Dependabot and CodeQL

---

For additional help or questions, please refer to the project documentation or contact the development team.
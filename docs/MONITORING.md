# DealFlow Monitoring & Maintenance Guide

Comprehensive guide for monitoring application health, performance, and maintenance procedures.

## Monitoring Overview

### Key Metrics
- **Application Performance**: Response times, throughput
- **Error Rates**: 4xx/5xx errors, exception tracking
- **User Experience**: Core Web Vitals, user flows
- **Infrastructure**: CPU, memory, network usage
- **Security**: Vulnerability scans, audit logs

### Monitoring Stack
- **Vercel Analytics**: Performance and usage metrics
- **Lighthouse CI**: Automated performance testing
- **GitHub Actions**: Build and deployment monitoring
- **Uptime Monitoring**: External service monitoring

## Performance Monitoring

### Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤2.5s | ≤4.0s | >4.0s |
| FID (First Input Delay) | ≤100ms | ≤300ms | >300ms |
| CLS (Cumulative Layout Shift) | ≤0.1 | ≤0.25 | >0.25 |
| TTFB (Time to First Byte) | ≤800ms | ≤1.8s | >1.8s |

### Vercel Analytics Setup

1. **Enable Analytics**:
```bash
npm install @vercel/analytics
```

2. **Add to Application**:
```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

3. **Environment Variables**:
```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
VERCEL_ANALYTICS_ID=your_analytics_id
```

### Real User Monitoring (RUM)

```tsx
// src/lib/monitoring.ts
export function trackPerformance() {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      // Track key metrics
      const metrics = {
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        tcp: perfData.connectEnd - perfData.connectStart,
        request: perfData.responseStart - perfData.requestStart,
        response: perfData.responseEnd - perfData.responseStart,
        dom: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        load: perfData.loadEventEnd - perfData.navigationStart,
      }
      
      // Send to analytics
      if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
        // Implementation for sending metrics
      }
    })
  }
}
```

## Error Monitoring

### Error Boundary Implementation

```tsx
// src/components/ErrorBoundary.tsx
'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Send to error tracking service
    if (process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING) {
      // Implementation for error reporting
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### API Error Tracking

```tsx
// src/lib/api-client.ts
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const startTime = Date.now()
  
  try {
    const response = await fetch(url, options)
    const duration = Date.now() - startTime
    
    // Log successful requests
    console.log(`API Request: ${options?.method || 'GET'} ${url} - ${response.status} (${duration}ms)`)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    const duration = Date.now() - startTime
    
    // Log failed requests
    console.error(`API Error: ${options?.method || 'GET'} ${url} - Failed (${duration}ms)`, error)
    
    // Send to error tracking
    if (process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING) {
      // Implementation for error reporting
    }
    
    throw error
  }
}
```

## Health Checks

### Application Health Endpoint

```tsx
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    checks: {
      database: 'healthy', // Future: actual database check
      external_apis: 'healthy', // Future: API connectivity check
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    }
  }

  return NextResponse.json(healthCheck)
}
```

### Detailed Status Endpoint

```tsx
// src/app/api/status/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const status = {
    application: {
      name: process.env.NEXT_PUBLIC_APP_NAME || 'DealFlow',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      build_time: process.env.BUILD_TIME || null,
    },
    system: {
      node_version: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    },
    features: {
      demo_mode: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE === 'true',
      analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      error_reporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
    }
  }

  return NextResponse.json(status)
}
```

## Automated Monitoring

### Uptime Monitoring Script

```bash
#!/bin/bash
# scripts/health-check.sh

HEALTH_URL="https://your-domain.vercel.app/api/health"
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $STATUS_CODE -eq 200 ]; then
    echo "✅ Health check passed (HTTP $STATUS_CODE)"
else
    echo "❌ Health check failed (HTTP $STATUS_CODE)"
    # Send alert (implementation depends on your notification system)
    # curl -X POST "https://hooks.slack.com/..." -d "{\"text\":\"🚨 DealFlow health check failed\"}"
fi
```

### GitHub Action for Monitoring

```yaml
# .github/workflows/monitoring.yml
name: Health Check Monitoring

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    
    steps:
      - name: Check Application Health
        run: |
          response=$(curl -s -w "HTTPSTATUS:%{http_code}" https://your-domain.vercel.app/api/health)
          body=$(echo $response | sed -E 's/HTTPSTATUS:[0-9]{3}$//')
          status=$(echo $response | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
          
          if [ $status -eq 200 ]; then
            echo "✅ Health check passed"
            echo $body | jq '.'
          else
            echo "❌ Health check failed with status $status"
            echo $body
            exit 1
          fi
```

## Performance Budgets

### Lighthouse CI Configuration

```javascript
// lighthouserc.js (updated)
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm start',
      startServerReadyPattern: 'Ready on',
      startServerReadyTimeout: 30000,
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // Performance budget
        'categories:performance': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Accessibility budget
        'categories:accessibility': ['error', { minScore: 0.9 }],
        
        // Best practices budget
        'categories:best-practices': ['error', { minScore: 0.85 }],
        
        // SEO budget
        'categories:seo': ['error', { minScore: 0.8 }],
        
        // Resource budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 500000 }], // 500KB
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 100000 }], // 100KB
        'resource-summary:image:size': ['error', { maxNumericValue: 1000000 }], // 1MB
      }
    }
  }
}
```

## Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly
- [ ] Review performance metrics and Core Web Vitals
- [ ] Check error rates and investigate new errors
- [ ] Review dependency updates from Dependabot
- [ ] Monitor resource usage and costs

#### Monthly  
- [ ] Security audit: `npm audit --audit-level high`
- [ ] Performance audit: Full Lighthouse analysis
- [ ] Review and update documentation
- [ ] Backup important data and configurations
- [ ] Test disaster recovery procedures

#### Quarterly
- [ ] Comprehensive security review
- [ ] Performance optimization review
- [ ] Infrastructure cost analysis
- [ ] Update monitoring and alerting rules
- [ ] Review and update maintenance procedures

### Automated Maintenance

#### Dependency Updates

```yaml
# .github/workflows/maintenance.yml
name: Maintenance Tasks

on:
  schedule:
    - cron: '0 2 * * 1'  # Monday 2 AM UTC
  workflow_dispatch:

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Security audit
        run: |
          npm audit --audit-level high
          npx audit-ci --config .auditrc.json
          
      - name: Check for outdated packages
        run: npm outdated || true
```

### Rollback Procedures

#### Quick Rollback
```bash
# Get current deployment
vercel ls

# Rollback to previous version
vercel rollback [previous-deployment-url]
```

#### Emergency Procedures
1. **Immediate Response**: Use Vercel dashboard to rollback
2. **Investigation**: Check logs and metrics to identify issue
3. **Communication**: Update status page and notify stakeholders
4. **Fix**: Create hotfix branch and deploy when ready
5. **Post-mortem**: Document incident and improve processes

## Alerting Configuration

### Key Alerts to Set Up

1. **Application Down**: Health check failures
2. **High Error Rate**: >5% 5xx errors in 5 minutes
3. **Performance Degradation**: LCP >4s or CLS >0.25
4. **Security Issues**: New vulnerabilities found
5. **Build Failures**: CI/CD pipeline failures

### Alert Channels
- **Slack**: Real-time notifications
- **Email**: Critical issues
- **SMS**: Emergency alerts (optional)
- **GitHub Issues**: Automatic issue creation for repeated problems

---

## Dashboard Templates

### Vercel Analytics Dashboard
Monitor key metrics:
- Page views and unique visitors
- Performance scores
- Error rates
- Geographic distribution

### Custom Monitoring Dashboard
Create dashboards for:
- Application health status
- Performance trends
- Error tracking
- User experience metrics

For questions or issues with monitoring setup, please refer to the main documentation or contact the DevOps team.
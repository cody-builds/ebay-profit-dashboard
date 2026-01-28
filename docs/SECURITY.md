# DealFlow Security Guide

Comprehensive security documentation for the DealFlow application covering development, deployment, and operational security practices.

## Security Overview

### Security Principles
- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimal access rights for all components
- **Zero Trust**: Verify everything, trust nothing
- **Security by Design**: Security considerations from development start

### Threat Model
- **Data Protection**: User data and business logic
- **API Security**: Secure communication with third-party services
- **Infrastructure**: Cloud platform and deployment security
- **Application**: Code vulnerabilities and runtime protection

## Application Security

### Content Security Policy (CSP)

Configured in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://vitals.vercel-insights.com;"
        }
      ]
    }
  ]
}
```

### Security Headers

All responses include security headers:

```tsx
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### Input Validation & Sanitization

```tsx
// src/lib/validation.ts
import { z } from 'zod'

// API input validation schemas
export const CalculationSchema = z.object({
  buyPrice: z.number().min(0).max(10000),
  buyShipping: z.number().min(0).max(100),
  sellPrice: z.number().min(0).max(10000),
  sellShipping: z.number().min(0).max(100).optional(),
})

export const SearchSchema = z.object({
  query: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s\-'".]+$/),
  minProfit: z.number().min(0).max(1000).optional(),
  minROI: z.number().min(0).max(1000).optional(),
  sortBy: z.enum(['profit', 'roi', 'confidence', 'recent']).optional(),
})

// Sanitization utilities
export function sanitizeHtml(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[^\w\s\-'".]/g, '')
    .substring(0, 100)
    .trim()
}
```

### API Security

#### Rate Limiting

```tsx
// src/lib/rate-limit.ts
import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS = parseInt(process.env.API_RATE_LIMIT || '100')

export function rateLimit(request: NextRequest): {
  success: boolean
  remaining: number
  resetTime: number
} {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous'
  const now = Date.now()
  
  // Clean up expired entries
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
  
  // Initialize or get current window
  if (!store[ip] || store[ip].resetTime < now) {
    store[ip] = {
      count: 0,
      resetTime: now + WINDOW_MS
    }
  }
  
  store[ip].count++
  
  const remaining = Math.max(0, MAX_REQUESTS - store[ip].count)
  const success = store[ip].count <= MAX_REQUESTS
  
  return {
    success,
    remaining,
    resetTime: store[ip].resetTime
  }
}
```

#### API Route Protection

```tsx
// src/app/api/opportunities/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { SearchSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  // Rate limiting
  const { success, remaining, resetTime } = rateLimit(request)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetTime.toString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }
  
  // Input validation
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  
  try {
    const validatedInput = SearchSchema.parse({
      query,
      minProfit: searchParams.get('minProfit') ? Number(searchParams.get('minProfit')) : undefined,
      minROI: searchParams.get('minROI') ? Number(searchParams.get('minROI')) : undefined,
      sortBy: searchParams.get('sortBy') || undefined,
    })
    
    // Process request...
    
    return NextResponse.json(
      { data: [] },
      {
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetTime.toString()
        }
      }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid input parameters' },
      { status: 400 }
    )
  }
}
```

## Environment Security

### Environment Variable Management

#### Secure Storage
```bash
# Production secrets (stored in Vercel)
DATABASE_URL=postgresql://user:password@host/db
JWT_SECRET=your-super-secret-256-bit-key
ENCRYPTION_KEY=32-character-encryption-key
TCGPLAYER_API_SECRET=secret-api-key
EBAY_API_SECRET=secret-api-key

# Public configuration (can be in code)
NEXT_PUBLIC_APP_NAME=DealFlow
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

#### Environment Validation

```tsx
// src/lib/env.ts
import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_API_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32).optional(),
  DATABASE_URL: z.string().url().optional(),
})

export const env = EnvSchema.parse(process.env)
```

### Secrets Management

#### JWT Token Security

```tsx
// src/lib/jwt.ts
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-for-development'
)

export async function signToken(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}
```

## Dependency Security

### Automated Vulnerability Scanning

#### Package Auditing

```bash
# Run security audit
npm audit --audit-level high

# Fix vulnerabilities automatically
npm audit fix

# Generate detailed security report
npm audit --json > security-audit.json
```

#### Dependency Monitoring

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  security-audit:
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
        
      - name: Run security audit
        run: |
          npm audit --audit-level high
          npx audit-ci --config .auditrc.json
          
      - name: Run Snyk security test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

### Approved Dependencies

Maintain a list of approved/audited dependencies:

```json
// security/approved-packages.json
{
  "approved": [
    "next@14.x",
    "react@18.x",
    "typescript@5.x",
    "@tanstack/react-query@5.x",
    "zustand@5.x"
  ],
  "restricted": [
    "eval",
    "vm2",
    "node-serialize"
  ],
  "lastUpdated": "2024-01-28"
}
```

## Data Security

### Data Classification

| Level | Description | Examples | Protection |
|-------|-------------|----------|------------|
| Public | Publicly available | Documentation, marketing content | Standard web security |
| Internal | Internal use only | Application logs, metrics | Access controls, HTTPS |
| Confidential | Sensitive business data | User preferences, analytics | Encryption at rest/transit |
| Restricted | Highly sensitive | API keys, user PII | Strong encryption, audit logs |

### Data Protection

#### Encryption Utilities

```tsx
// src/lib/encryption.ts
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-key-for-dev-only'
const ALGORITHM = 'aes-256-gcm'

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
  cipher.setAAD(Buffer.from('dealflow'))
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
  decipher.setAAD(Buffer.from('dealflow'))
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

## Infrastructure Security

### Vercel Security Configuration

#### Platform Security Features
- **HTTPS by default**: All traffic encrypted in transit
- **DDoS protection**: Automatic protection against attacks
- **Edge caching**: Reduced server load and improved performance
- **Geographic distribution**: Reduced attack surface

#### Deployment Security

```json
// vercel.json security configuration
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

## Monitoring & Incident Response

### Security Monitoring

#### Log Security Events

```tsx
// src/lib/security-logger.ts
interface SecurityEvent {
  type: 'auth_failure' | 'rate_limit' | 'input_validation' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  details: any
  timestamp: Date
}

export function logSecurityEvent(event: SecurityEvent) {
  const logEntry = {
    ...event,
    id: crypto.randomUUID(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Security Event:', logEntry)
  }
  
  // Send to security monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // Implementation for security monitoring service
  }
  
  // Immediate alerts for critical events
  if (event.severity === 'critical') {
    // Implementation for immediate alerting
  }
}
```

### Incident Response Plan

#### Detection
1. **Automated Monitoring**: Security alerts from various sources
2. **Manual Reports**: User reports or team discovery
3. **Third-party Notifications**: Dependency vulnerabilities

#### Response Procedures
1. **Assess**: Determine severity and scope
2. **Contain**: Limit impact and prevent spread
3. **Investigate**: Understand root cause and affected systems
4. **Remediate**: Fix the issue and restore normal operations
5. **Document**: Record incident details and lessons learned

#### Emergency Contacts
- **Security Team**: security@company.com
- **DevOps Team**: devops@company.com
- **Management**: management@company.com

## Security Checklist

### Development Phase
- [ ] Code review for security issues
- [ ] Input validation implemented
- [ ] Output encoding/escaping applied
- [ ] Authentication/authorization tested
- [ ] Dependency vulnerability scan passed
- [ ] Security unit tests written

### Pre-deployment
- [ ] Security headers configured
- [ ] HTTPS enforced everywhere
- [ ] Environment variables secured
- [ ] Rate limiting implemented
- [ ] Error handling doesn't leak information
- [ ] Security monitoring configured

### Production
- [ ] Regular security audits
- [ ] Vulnerability monitoring active
- [ ] Incident response plan tested
- [ ] Security patches applied timely
- [ ] Access logs monitored
- [ ] Backup and recovery tested

## Security Resources

### Tools & Services
- **Static Analysis**: ESLint security rules, SonarQube
- **Dependency Scanning**: npm audit, Snyk, Dependabot
- **Runtime Protection**: Vercel security features
- **Monitoring**: Vercel analytics, custom security logging

### Best Practices
- **OWASP Top 10**: Address common web vulnerabilities
- **Secure Coding**: Follow secure development practices
- **Regular Updates**: Keep dependencies and tools current
- **Security Training**: Stay updated on latest threats

### External Resources
- [OWASP Application Security](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Vercel Security Documentation](https://vercel.com/docs/security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

---

For security incidents or questions, contact the security team immediately. Do not delay reporting potential security issues.
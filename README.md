# DealFlow - Pokemon Card Arbitrage Tool

Find profitable Pokemon card flips between TCGPlayer and eBay with real profit calculations.

![DealFlow](https://img.shields.io/badge/Pokemon-Arbitrage-yellow)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

### 🔥 Arbitrage Detection
- Compare TCGPlayer buy prices vs eBay sold prices
- Automatic opportunity detection sorted by profit
- Risk assessment (low/medium/high) based on sales volume and price volatility

### 💰 Real Profit Calculator
- Accurate eBay fee calculation (13.25% final value + $0.30)
- Shipping cost options (PWE, Bubble, BMWT)
- ROI and profit margin calculations
- No surprises when you sell

### 📱 Mobile-First Design
- Responsive cards for quick checking
- Dark mode interface
- Fast performance for on-the-go flipping

## Quick Start

```bash
cd /home/ubuntu/clawd/projects/dealflow-app

# Install dependencies
npm install

# Run development server
npm run dev -- -p 3100

# Build for production
npm run build
npm start
```

## Project Structure

```
dealflow-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── opportunities/        # Deals listing
│   │   ├── calculator/           # Profit calculator
│   │   └── api/
│   │       ├── opportunities/    # Opportunities API
│   │       └── calculate/        # Calculator API
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── OpportunityCard.tsx
│   │   ├── ProfitCalculator.tsx
│   │   └── SearchFilters.tsx
│   └── lib/
│       ├── types.ts              # TypeScript types
│       ├── calculator.ts         # Fee calculations
│       └── mock-data.ts          # Demo data
```

## API Endpoints

### GET /api/opportunities
Returns arbitrage opportunities.

Query params:
- `demo=true` - Use demo data
- `query` - Search by card name/set
- `minProfit` - Minimum profit filter
- `minROI` - Minimum ROI filter
- `sortBy` - profit|roi|confidence|recent

### POST /api/calculate
Calculate profit for a flip.

Body:
```json
{
  "buyPrice": 50.00,
  "buyShipping": 2.99,
  "sellPrice": 75.00
}
```

### GET /api/calculate
Returns fee structure information.

## Fee Structure

eBay Trading Cards category:
- **Final Value Fee**: 13.25% of sale price
- **Transaction Fee**: $0.30 per order

Shipping options:
- **PWE**: ~$1.50 (Plain White Envelope, no tracking)
- **Bubble**: ~$4.50 (Bubble mailer)
- **BMWT**: ~$5.50 (Bubble Mail with Tracking)

## Profit Formula

```
Net Profit = Sale Price - Buy Cost - (Sale Price × 13.25%) - $0.30 - Shipping Cost
```

## Future Enhancements

- [ ] Real TCGPlayer API integration
- [ ] eBay sold price scraping
- [ ] Price alerts
- [ ] Portfolio tracking
- [ ] Historical price charts
- [ ] Bulk card scanning

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## DevOps & Deployment

This project includes comprehensive DevOps infrastructure:

### 🚀 Deployment
- **Platform**: Vercel
- **CI/CD**: GitHub Actions
- **Environment Management**: Automated with environment-specific configurations
- **Monitoring**: Vercel Analytics + Lighthouse CI

### 📊 Quality Assurance
- **Testing**: Jest + React Testing Library
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint + Prettier
- **Security**: Automated vulnerability scanning
- **Performance**: Lighthouse CI with performance budgets

### 📚 Documentation
Complete documentation available in `/docs`:
- **[Setup Guide](./docs/SETUP.md)** - Development environment setup
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment with Vercel
- **[Monitoring Guide](./docs/MONITORING.md)** - Health monitoring and performance
- **[Security Guide](./docs/SECURITY.md)** - Security practices and configurations

### 🔄 Automated Workflows
- **PR Checks**: Tests, linting, type checking, security scans
- **Performance Testing**: Lighthouse CI on every pull request
- **Dependency Updates**: Automated via Dependabot
- **Security Monitoring**: CodeQL and vulnerability scanning

### 🎯 Performance Targets
- Lighthouse Performance: >80
- First Contentful Paint: <2s
- Test Coverage: >70%
- Zero high/critical vulnerabilities

## Getting Started (DevOps)

```bash
# Clone and setup
git clone https://github.com/YOUR_USERNAME/dealflow-app.git
cd dealflow-app
npm install

# Configure environment
cp .env.example .env.local

# Start development
npm run dev

# Run full test suite
npm run test:ci

# Check build and performance
npm run build
npm run analyze
```

For detailed setup instructions, see the [Setup Guide](./docs/SETUP.md).

## License

MIT - Built for Pokemon card flippers

# DealFlow Development Setup Guide

Complete guide to set up the DealFlow development environment.

## System Requirements

- **Node.js**: 20.x or later
- **npm**: 10.x or later
- **Git**: Latest version
- **VS Code**: Recommended editor

## Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/dealflow-app.git
cd dealflow-app

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Detailed Setup

### 1. Prerequisites Installation

#### Node.js & npm
```bash
# Using Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Verify installation
node --version  # Should be 20.x
npm --version   # Should be 10.x
```

#### Git
```bash
# macOS
brew install git

# Ubuntu/Debian
sudo apt update && sudo apt install git

# Windows
# Download from https://git-scm.com/download/win
```

### 2. Project Setup

#### Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/dealflow-app.git
cd dealflow-app
```

#### Install Dependencies
```bash
# Install all dependencies
npm install

# For clean installs (recommended for production)
npm ci
```

#### Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local  # or use your preferred editor
```

### 3. Development Environment

#### VS Code Setup (Recommended)

Install recommended extensions:
```bash
# Install VS Code extensions
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension formulahendry.auto-rename-tag
```

Create `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

#### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev:debug    # Start with debugging enabled

# Building
npm run build        # Build for production
npm run start        # Start production server
npm run analyze      # Analyze bundle size

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ci      # Run tests for CI environment

# Utilities
npm run clean        # Clean build artifacts
```

### 4. Development Workflow

#### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name
# Then create PR on GitHub
```

#### Code Standards

1. **TypeScript**: All code must be typed
2. **ESLint**: Fix all linting errors
3. **Prettier**: Code is auto-formatted
4. **Testing**: Write tests for new features
5. **Commits**: Follow conventional commit format

#### Branch Strategy
- `main`: Production-ready code
- `develop`: Development integration
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Emergency fixes

### 5. Project Structure

```
dealflow-app/
├── .github/               # GitHub Actions workflows
├── docs/                  # Documentation
├── public/                # Static assets
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── globals.css   # Global styles
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # Reusable components
│   ├── lib/             # Utilities and helpers
│   └── __tests__/       # Test files
├── .env.example         # Environment template
├── .env.local          # Local environment (git-ignored)
├── next.config.mjs     # Next.js configuration
├── package.json        # Dependencies and scripts
├── tailwind.config.ts  # Tailwind CSS config
└── tsconfig.json       # TypeScript config
```

### 6. Architecture Overview

#### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand, React Query
- **API**: Next.js API routes
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

#### Key Features
- **Server-Side Rendering**: For better SEO and performance
- **API Integration**: Ready for TCGPlayer and eBay APIs
- **Responsive Design**: Mobile-first approach
- **Type Safety**: Full TypeScript coverage
- **Testing**: Unit and integration tests

### 7. Database Setup (Future)

```sql
-- PostgreSQL schema (for future implementation)
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY,
  card_name VARCHAR(255) NOT NULL,
  set_name VARCHAR(255),
  buy_price DECIMAL(10,2),
  sell_price DECIMAL(10,2),
  profit DECIMAL(10,2),
  roi DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 8. API Integration (Future)

#### TCGPlayer API Setup
```javascript
// lib/tcgplayer.ts
const TCGPLAYER_API_BASE = 'https://api.tcgplayer.com'

export async function fetchCardPrices(cardName: string) {
  // Implementation for TCGPlayer API
}
```

#### eBay API Setup
```javascript
// lib/ebay.ts
const EBAY_API_BASE = 'https://api.ebay.com'

export async function fetchSoldPrices(cardName: string) {
  // Implementation for eBay API
}
```

### 9. Troubleshooting

#### Common Issues

1. **Port 3000 already in use**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

2. **Node modules issues**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

3. **TypeScript errors**:
```bash
# Check types
npm run type-check

# Restart TypeScript server in VS Code
Cmd+Shift+P > "TypeScript: Restart TS Server"
```

4. **Build failures**:
```bash
# Clean build
rm -rf .next
npm run build
```

### 10. Performance Optimization

#### Bundle Analysis
```bash
npm run analyze
```

#### Image Optimization
- Use Next.js `Image` component
- Optimize images before adding to public folder
- Consider using Vercel Image Optimization

#### Code Splitting
- Use dynamic imports for heavy components
- Implement lazy loading where appropriate

### 11. Testing Strategy

#### Unit Tests
```bash
# Test specific component
npm test -- --testNamePattern="Calculator"

# Test with coverage
npm run test:coverage
```

#### Integration Tests
```bash
# Test API routes
npm test -- src/__tests__/api/
```

#### E2E Tests (Future)
```bash
# Playwright or Cypress integration planned
npm run test:e2e
```

---

## Need Help?

- **Documentation**: Check `/docs` folder
- **Issues**: Create GitHub issue
- **Discussions**: Use GitHub Discussions
- **Code Review**: All changes require PR review

Happy coding! 🚀
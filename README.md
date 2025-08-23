# Total Reality Engineering - Portfolio Website

A minimal, flashy portfolio showcasing innovative GitHub projects with a modern, terminal-inspired design.

## 🚀 Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔐 GitHub API configuration

This site lists repositories via the GitHub REST API. You can run it without authentication (low rate limits), or configure a token for higher limits.

Environment variables:

```bash
# Optional: increases rate limits
export GITHUB_USERNAME="rgilks"    # or your GitHub username
export GITHUB_TOKEN="<your_token>" # classic or fine-grained PAT with at least public repo read

# Required for production: cron job authentication
export CRON_SECRET="<random_secret>" # secret key for cron job authentication

# Optional: Cloudflare Images for image hosting
export CLOUDFLARE_ACCOUNT_ID="<your_account_id>" # Cloudflare account ID
export CLOUDFLARE_IMAGES_API_TOKEN="<your_api_token>" # API token with Images:Edit permissions
```

Notes:

- If `GITHUB_TOKEN` is set, it will be sent as `Authorization: token <PAT>` (works for classic and fine-grained tokens).
- On a 401 with a provided token, the app retries unauthenticated automatically for resiliency.
- If `GITHUB_TOKEN` is not set, requests are unauthenticated (no Authorization header), which may hit rate limits but should not 401.
- Make sure the token has not expired and has at least public repo read permissions.
- `CRON_SECRET` should be a random string used to authenticate cron job requests to refresh GitHub data.
- `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_IMAGES_API_TOKEN` are optional and enable automatic image hosting in Cloudflare Images with CDN optimization.

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm start           # Start production server

# Building
npm run build       # Build for production
npm run build:cf    # Build for Cloudflare Workers

# Testing
npm test            # Run tests in watch mode
npm test -- --run   # Run tests once
npm run test:e2e    # Run Playwright e2e tests

# Code Quality
npm run lint        # Lint code
npm run type-check  # TypeScript type checking
npm run format      # Format code with Prettier
npm run check       # Run all checks (lint + type-check + format)

# Dependencies
npm run deps:update # Update all dependencies
npm run nuke        # Clean install (remove node_modules and reinstall)
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS v4 with custom animations
- **State Management:** Zustand with Immer
- **Testing:** Vitest for unit tests, Playwright for e2e
- **Deployment:** Cloudflare Workers using OpenNext
- **Caching:** Cloudflare KV for GitHub data with 6-hour TTL
- **PWA:** Service worker with offline support
- **Video Integration:** YouTube iframe API with responsive design

## 🎨 Features

- **Animated TRE Logo** - Custom SVG with entrance animations and glow effects
- **Responsive Design** - Mobile-first approach with terminal-inspired aesthetics
- **Project Portfolio** - GitHub integration with screenshots and descriptions
- **Interactive Demos** - Click "Website" button to view projects in embedded iframes (tre.systems subdomains)
- **YouTube Videos** - Embedded video support for project demonstrations
- **PWA Ready** - Fully installable Progressive Web App with offline support
- **Performance Optimized** - Image optimization and lazy loading
- **Offline Capable** - Service worker caches critical assets and provides offline fallbacks

## 🌐 Live Demo

Visit [tre.systems](https://tre.systems) to see the live portfolio.

## 📱 PWA Features

This website is a fully functional Progressive Web App (PWA) that provides:

- **Installable** - Add to home screen on mobile and desktop
- **Offline Support** - Access previously visited pages without internet
- **Fast Loading** - Intelligent caching strategies for optimal performance
- **Native App Experience** - Standalone mode with custom theme colors

### PWA Testing

```bash
# Run PWA audit with Lighthouse
npm run pwa:audit

# Generate full Lighthouse report
npm run pwa:test
```

### PWA Components

- **Service Worker** (`/public/sw.js`) - Handles caching and offline functionality
- **Web App Manifest** (`/public/manifest.webmanifest`) - Defines app appearance and behavior
- **Install Prompt** - Smart banner for PWA installation
- **Offline Page** - Graceful fallback when offline

## 📖 Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - state management
- [Framer Motion](https://www.framer.com/motion/) - animation library

## ☁️ Deploying to Cloudflare Workers (OpenNext)

This repo is configured to deploy with **OpenNext** to **Cloudflare Workers** (Pages-style static assets served by Workers).

### Caching System

The application uses intelligent caching to avoid GitHub API rate limits:

**Production (Cloudflare Workers):**

- **Cloudflare KV** storage for cached GitHub API responses
- **Cache TTL:** 6 hours (configurable in `src/lib/githubCache.ts`)
- **Automatic Refresh:** Cron trigger runs every 6 hours to refresh data

**Development (Local):**

- **File-based caching** in `.cache/` directory (automatically created)
- **Same TTL:** 6 hours to match production behavior
- **No KV dependency:** Works without Cloudflare infrastructure
- **Screenshot caching:** Separate 24-hour TTL for screenshot URLs

**Features:**

- **Fallback:** If caching fails, falls back to direct GitHub API calls
- **Smart Detection:** Automatically chooses the right cache based on environment
- **Transparent:** Users always get the latest data within the TTL window
- **Dual Caching:** Separate caches for project metadata (6h) and screenshots (24h)
- **Rate Limit Protection:** Minimizes GitHub API calls for both data and images
- **Cloudflare Images:** Optional image hosting with automatic optimization and CDN

The caching system ensures consistent behavior between development and production while efficiently managing API calls.

### Prerequisites

- Create a Cloudflare Pages project (build command will be handled by the GitHub Action).
- Generate a Cloudflare API token with Pages:Edit and Account:Read permissions.

### GitHub Secrets

Add these repository secrets:

- `CLOUDFLARE_API_TOKEN`: API token with Pages permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
  (No Pages project needed; deployment uses `wrangler deploy`.)

### Build locally (optional)

```bash
npm install
npm run build:cf
# Outputs in `.open-next/` (assets + server functions)
```

### CI/CD

On push to `main`, the workflow in `.github/workflows/deploy.yml` will:

1. Install deps and run `

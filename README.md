# TRE Website

The official website for Total Reality Engineering, showcasing innovative projects and engineering solutions.

## Features

- **Modern PWA**: Progressive Web App with offline support, install prompts, and service worker caching
- **Project Showcase**: Dynamic GitHub integration displaying public repositories with screenshots
- **Project Detail Views**: Individual project pages with iframe embeds and YouTube video support
- **Responsive Design**: Mobile-first design with Tailwind CSS and smooth animations
- **Cloudflare Integration**: Built with Next.js and deployed on Cloudflare Workers
- **Smart Caching**: KV-based caching for GitHub data and project screenshots with 6-hour TTL
- **YouTube Integration**: Responsive video embeds with 16:9 aspect ratio across devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom TRE theme and Framer Motion animations
- **State Management**: Zustand with Immer for immutable updates
- **Deployment**: Cloudflare Workers via OpenNext
- **Caching**: Cloudflare KV for production, local file system for development
- **Testing**: Vitest for unit tests, Playwright for E2E tests
- **PWA**: Service worker with offline caching and install prompts

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare account (for production deployment)

### Local Development

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd tre-website
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file with your GitHub token:

   ```bash
   GITHUB_TOKEN=your_github_token_here
   GITHUB_USERNAME=rgilks
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

For local development, create a `.env.local` file:

```env
# GitHub API (required for higher rate limits)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_USERNAME=rgilks

# Cloudflare Images (optional, for image optimization)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_IMAGES_API_TOKEN=your_cloudflare_images_api_token

# Cron job secret (for automated data refresh)
CRON_SECRET=your_random_secret_string
```

## Production Deployment

### Cloudflare Workers Setup

1. **Install Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Set up Cloudflare Secrets**:

   ```bash
   # GitHub API token
   wrangler secret put GITHUB_TOKEN

   # Cloudflare account ID
   wrangler secret put CLOUDFLARE_ACCOUNT_ID

   # Cloudflare Images API token
   wrangler secret put CLOUDFLARE_IMAGES_API_TOKEN

   # Cron job secret
   wrangler secret put CRON_SECRET
   ```

4. **Deploy to Cloudflare**:
   ```bash
   npm run build:cf
   npm run deploy:cf
   ```

### KV Namespace

The project uses Cloudflare KV for caching GitHub data and project screenshots. The KV namespace is automatically created during deployment.

### Cron Jobs

A cron job runs every 6 hours to refresh GitHub data and keep the cache up to date. The cron endpoint is protected by the `CRON_SECRET` environment variable.

## Architecture

### Caching Strategy

- **Development**: Local file system caching
- **Production**: Cloudflare KV caching with automatic fallback
- **Cache TTL**: 6 hours for project data, 24 hours for screenshots

### Environment Detection

The application automatically detects whether it's running in:

- **Development**: Uses local file system and `.env` variables
- **Cloudflare Workers**: Uses KV storage and Cloudflare environment variables

### Services

- **GitHub Service**: Fetches repository data and screenshots with large file handling
- **Cache Service**: Manages data caching with environment-appropriate backend
- **Image Cache Service**: Handles screenshot URL caching
- **Cloudflare Images**: Optional image optimization service

### PWA Features

- **Service Worker**: Cache-first for static assets, stale-while-revalidate for navigation
- **Offline Support**: Graceful degradation with offline page fallback
- **Install Prompts**: Smart install banner with dismissal tracking
- **Manifest**: Enhanced with categories, shortcuts, and multiple icon sizes

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
npm test
```

### E2E Tests

Run Playwright tests:

```bash
npm run test:e2e
```

### Type Checking

Check TypeScript types:

```bash
npm run type-check
```

### Linting

Run ESLint:

```bash
npm run lint
```

### Full Check

Run all checks (lint, type-check, tests):

```bash
npm run check
```

## Troubleshooting

### GitHub Token Issues

If you encounter authentication errors, the application will provide detailed error messages in the console:

#### Common Issues:

1. **Token Expired or Invalid (401 Error)**
   - Generate a new token at [GitHub Settings > Tokens](https://github.com/settings/tokens)
   - Ensure the token has `public_repo` and `read:user` permissions
   - Update your `.env.local` file and restart the dev server

2. **Rate Limiting (403 Error)**
   - Without a token: Limited to 60 requests/hour
   - With a valid token: 5000 requests/hour
   - Add `GITHUB_TOKEN` to `.env.local` for higher limits

3. **Token Validation**
   - The app automatically validates tokens on startup
   - Invalid tokens are detected early with helpful suggestions
   - Falls back to unauthenticated requests if needed

#### Token Setup Steps:

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "TRE Website Development")
4. Select scopes: `public_repo` and `read:user`
5. Copy the token and add to `.env.local`:
   ```env
   GITHUB_TOKEN=ghp_your_token_here
   ```
6. Restart your development server

### Environment Variable Issues

- Ensure `.env.local` has no leading spaces
- Restart the dev server after changing environment variables
- Check that all required variables are set

### Build Issues

If you encounter build errors:

```bash
# Clean and reinstall dependencies
npm run nuke

# Check for type errors
npm run type-check

# Verify all tests pass
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the full test suite
6. Submit a pull request

## License

This project is proprietary to Total Reality Engineering.

## Support

For questions or support, contact [Robert Gilks](https://www.linkedin.com/in/rob-gilks-39bb03/).

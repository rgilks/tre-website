# TRE Website

The official website for Total Reality Engineering, showcasing innovative projects and engineering solutions.

## Features

- **Modern PWA**: Progressive Web App with offline support and install prompts
- **Project Showcase**: Dynamic GitHub integration displaying public repositories
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Cloudflare Integration**: Built with Next.js and deployed on Cloudflare Workers
- **Smart Caching**: KV-based caching for GitHub data and project screenshots

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom TRE theme
- **Deployment**: Cloudflare Workers via OpenNext
- **Caching**: Cloudflare KV for production, local file system for development
- **Testing**: Vitest for unit tests, Playwright for E2E tests

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
   npm run build
   npm run deploy
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

- **GitHub Service**: Fetches repository data and screenshots
- **Cache Service**: Manages data caching with environment-appropriate backend
- **Image Cache Service**: Handles screenshot URL caching
- **Cloudflare Images**: Optional image optimization service

## Testing

### Unit Tests

Run unit tests with Vitest:

```bash
npm test
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

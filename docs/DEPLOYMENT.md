# Cloudflare Workers Deployment Guide

This guide covers deploying the TRE Website to Cloudflare Workers using OpenNext.

## Prerequisites

- Cloudflare account
- Node.js 18+ and npm
- Wrangler CLI installed globally

## Setup Steps

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

### 3. Configure Cloudflare Secrets

The application requires several secrets to function properly in production. Set these using the Wrangler CLI:

#### GitHub API Token

```bash
wrangler secret put TOKEN_GITHUB
```

When prompted, enter your GitHub Personal Access Token. This token should have:

- `public_repo` scope (for classic tokens)
- Or `Contents: Read` permission (for fine-grained tokens)

#### Cloudflare Account ID

```bash
wrangler secret put CLOUDFLARE_ACCOUNT_ID
```

Enter your Cloudflare account ID (found in the Cloudflare dashboard).

#### Cloudflare Images API Token

```bash
wrangler secret put CLOUDFLARE_IMAGES_API_TOKEN
```

Enter an API token with `Cloudflare Images:Edit` permissions.

#### Cron Job Secret

```bash
wrangler secret put CRON_SECRET
```

Enter a random secret string (e.g., `tre-cron-2024-secret-key`). This protects the cron endpoint.

### 4. Verify Configuration

Check your current secrets:

```bash
wrangler secret list
```

### 5. Build and Deploy

```bash
# Build the application
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

## Environment Variables Reference

| Variable                      | Required | Description                             | Local Development | Production        |
| ----------------------------- | -------- | --------------------------------------- | ----------------- | ----------------- |
| `TOKEN_GITHUB`                | Yes      | GitHub API token for higher rate limits | `.env.local`      | Cloudflare Secret |
| `GITHUB_USERNAME`             | No       | GitHub username (defaults to 'rgilks')  | `.env.local`      | Hardcoded         |
| `CLOUDFLARE_ACCOUNT_ID`       | No       | Cloudflare account ID for Images API    | `.env.local`      | Cloudflare Secret |
| `CLOUDFLARE_IMAGES_API_TOKEN` | No       | Cloudflare Images API token             | `.env.local`      | Cloudflare Secret |
| `CRON_SECRET`                 | Yes      | Secret for cron job authentication      | `.env.local`      | Cloudflare Secret |

## KV Namespace

The application automatically creates and uses a KV namespace called `GITHUB_CACHE` for:

- Caching GitHub project data (6-hour TTL)
- Storing project screenshot URLs (24-hour TTL)

## Cron Jobs

A cron job runs every 6 hours to refresh GitHub data. The cron endpoint is:

- **URL**: `https://tre.systems/api/cron`
- **Method**: GET
- **Authentication**: Bearer token using `CRON_SECRET`
- **Schedule**: Every 6 hours (configured in `wrangler.toml`)

## Troubleshooting

### Common Issues

1. **"TOKEN_GITHUB not configured"**
   - Ensure you've set the secret: `wrangler secret put TOKEN_GITHUB`

2. **"KV namespace not found"**
   - The KV namespace is created automatically during deployment
   - Check that your account has KV permissions

3. **"Cron job unauthorized"**
   - Verify `CRON_SECRET` is set correctly
   - Check the cron job is using the correct secret

4. **"File system not implemented"**
   - This error occurs when the app tries to use local file system in Cloudflare
   - The updated code should automatically use KV storage in production

### Debugging

Check Cloudflare Workers logs:

```bash
wrangler tail
```

### Local Testing

Test the production build locally:

```bash
npm run build
wrangler dev
```

## Security Considerations

- **GitHub Token**: Use fine-grained tokens with minimal permissions
- **Cron Secret**: Use a strong, random secret for cron authentication
- **API Tokens**: Rotate Cloudflare API tokens regularly
- **Rate Limits**: The app handles GitHub API rate limits gracefully

## Monitoring

Monitor your deployment:

- **Cloudflare Dashboard**: Check Workers performance and errors
- **KV Analytics**: Monitor cache hit rates and storage usage
- **Cron Job Logs**: Verify automated data refresh is working

## Rollback

If you need to rollback:

```bash
# List deployments
wrangler deployments list

# Rollback to previous version
wrangler rollback <deployment-id>
```

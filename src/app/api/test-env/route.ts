import { NextResponse } from 'next/server'

export async function GET() {
  // Check what's available in the environment
  const env = process.env
  const globalThisKeys = Object.keys(globalThis).filter(
    key =>
      key.includes('GITHUB') || key.includes('CLOUDFLARE') || key.includes('KV')
  )

  // Check if we can access any Cloudflare-specific globals
  const cloudflareGlobals = {
    hasCloudflareWorker: '__CLOUDFLARE_WORKER__' in globalThis,
    hasGithubCache: 'GITHUB_CACHE' in globalThis,
    globalThisKeys,
    envKeys: Object.keys(env).filter(
      key =>
        key.includes('GITHUB') ||
        key.includes('CLOUDFLARE') ||
        key.includes('KV')
    ),
  }

  // Test GitHub API directly
  const token = globalThis.GITHUB_TOKEN || process.env.GITHUB_TOKEN
  let githubTest: {
    success: boolean
    error: string | null
    status: number | null
    headers: Record<string, string> | null
    tokenPreview: string | null
  } = {
    success: false,
    error: null,
    status: null,
    headers: null,
    tokenPreview: null,
  }

  if (token) {
    try {
      const headers = {
        Authorization: `token ${token}`,
        'User-Agent': 'tre-website-test',
      }

      const response = await fetch('https://api.github.com/user', { headers })

      githubTest = {
        success: response.ok,
        error: response.statusText,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        tokenPreview:
          token.substring(0, 10) + '...' + token.substring(token.length - 4),
      }
    } catch (error) {
      githubTest.error =
        error instanceof Error ? error.message : 'Unknown error'
    }
  }

  return NextResponse.json({
    message: 'Environment test',
    cloudflareGlobals,
    githubTest,
    tokenExists: !!token,
    tokenLength: token ? token.length : 0,
    timestamp: new Date().toISOString(),
  })
}

// Cloudflare environment context for passing KV bindings to Next.js functions
export interface CloudflareEnvironment {
  GITHUB_CACHE?: KVNamespace
}

// Global context that can be set by the worker and accessed by Next.js functions
let cloudflareEnv: CloudflareEnvironment | undefined

// Set the Cloudflare environment (called by the worker)
export function setCloudflareEnvironment(env: CloudflareEnvironment | undefined): void {
  cloudflareEnv = env
}

// Get the Cloudflare environment (called by Next.js functions)
export function getCloudflareEnvironment(): CloudflareEnvironment | undefined {
  return cloudflareEnv
}

// Check if we're in a Cloudflare Workers environment
export function isCloudflareWorker(): boolean {
  return typeof globalThis !== 'undefined' && '__CLOUDFLARE_WORKER__' in globalThis
}

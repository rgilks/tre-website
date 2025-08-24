import { setCloudflareEnvironment, CloudflareEnvironment } from './cloudflareContext'

// Wrapper function to set Cloudflare environment context and then execute a function
export async function withCloudflareContext<T>(
  env: CloudflareEnvironment,
  fn: () => Promise<T>
): Promise<T> {
  // Set the environment context
  setCloudflareEnvironment(env)
  
  try {
    // Execute the function with the context set
    return await fn()
  } finally {
    // Clean up the context after execution
    setCloudflareEnvironment(undefined)
  }
}

// Alternative wrapper for synchronous functions
export function withCloudflareContextSync<T>(
  env: CloudflareEnvironment,
  fn: () => T
): T {
  // Set the environment context
  setCloudflareEnvironment(env)
  
  try {
    // Execute the function with the context set
    return fn()
  } finally {
    // Clean up the context after execution
    setCloudflareEnvironment(undefined)
  }
}

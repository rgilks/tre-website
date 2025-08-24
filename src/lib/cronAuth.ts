import { NextRequest } from 'next/server'

export interface CronAuthResult {
  isValid: boolean
  error?: string
  details?: string
  status: number
}

export function validateCronAuth(request: NextRequest): CronAuthResult {
  const authHeader = request.headers.get('authorization')
  
  // Get cron secret from Cloudflare environment variables or fall back to process.env for local development
  const cronSecret = globalThis.CRON_SECRET || process.env.CRON_SECRET
  
  if (!cronSecret) {
    console.error('🚨 CRON_SECRET not configured in environment variables')
    console.error('💡 Add CRON_SECRET to .env.local for local development')
    console.error('💡 Add CRON_SECRET to Cloudflare secrets for production')
    return {
      isValid: false,
      error: 'CRON_SECRET not configured',
      details: 'Please add CRON_SECRET to your environment variables',
      status: 500
    }
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('🚨 Cron job authentication failed')
    console.error('💡 Check that the Authorization header matches your CRON_SECRET')
    console.error('📝 Expected: Bearer <your_cron_secret>')
    return {
      isValid: false,
      error: 'Unauthorized',
      details: 'Invalid or missing Authorization header. Check CRON_SECRET configuration.',
      status: 401
    }
  }

  return {
    isValid: true,
    status: 200
  }
}

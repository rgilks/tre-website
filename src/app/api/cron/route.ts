import { NextRequest, NextResponse } from 'next/server'
import { refreshProjects } from '@/lib/projects'

// Extend globalThis to include Cloudflare environment variables
declare global {
  var CRON_SECRET: string | undefined
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  // Get cron secret from Cloudflare environment variables or fall back to process.env for local development
  const cronSecret = globalThis.CRON_SECRET || process.env.CRON_SECRET
  
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await refreshProjects()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

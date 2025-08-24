import { NextRequest, NextResponse } from 'next/server'

import { refreshProjects } from '@/lib/projects'
import { validateCronAuth } from '@/lib/cronAuth'

// Extend globalThis to include Cloudflare environment variables
declare global {
  var CRON_SECRET: string | undefined
}

export async function GET(request: NextRequest) {
  const authResult = validateCronAuth(request)

  if (!authResult.isValid) {
    return NextResponse.json(
      {
        error: authResult.error,
        details: authResult.details,
      },
      { status: authResult.status }
    )
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

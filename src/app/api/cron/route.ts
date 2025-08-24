import { NextRequest, NextResponse } from 'next/server'

import { refreshProjects } from '@/lib/projects'
import { validateCronAuth } from '@/lib/cronAuth'

declare global {
  var CRON_SECRET: string | undefined
  var GITHUB_CACHE: KVNamespace | undefined
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
    const env = {
      GITHUB_CACHE: globalThis.GITHUB_CACHE,
    }

    const result = await refreshProjects(env)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

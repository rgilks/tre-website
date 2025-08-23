import { NextRequest, NextResponse } from 'next/server'
import { fetchGitHubProjects } from '@/lib/github'

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (you can add more security here)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Cron trigger: refreshing GitHub data')
    
    // In production, this will have KV access via Cloudflare Workers
    // For now, we'll just fetch fresh data
    const projects = await fetchGitHubProjects()
    
    console.log(`Successfully refreshed ${projects.length} projects`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Refreshed ${projects.length} projects`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error during scheduled GitHub refresh:', error)
    return NextResponse.json({ 
      error: 'Failed to refresh projects' 
    }, { status: 500 })
  }
}

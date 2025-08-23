import { NextResponse } from 'next/server'
import { fetchProjectScreenshots } from '@/lib/github'

export async function GET() {
  try {
    console.log('=== TEST SCREENSHOTS API ===')
    
    // Test with a repository that we know has a screenshot
    const projectName = 'geno-1'
    console.log(`Testing screenshot fetching for: ${projectName}`)
    
    // Test the GitHub API directly first
    const testUrl = `https://api.github.com/repos/rgilks/${projectName}/contents/docs/screenshot.png`
    console.log(`Testing direct GitHub API call to: ${testUrl}`)
    
    try {
      const response = await fetch(testUrl)
      console.log(`Direct API response status: ${response.status}`)
      console.log(`Direct API response ok: ${response.ok}`)
      
      if (response.ok) {
        const content = await response.json() as {
          download_url?: string
          _links?: { git?: string }
        }
        console.log(`Direct API content:`, content)
        if (content.download_url) {
          console.log(`Direct API download_url: ${content.download_url}`)
        }
      }
    } catch (directError) {
      console.error('Direct API call failed:', directError)
    }
    
    // Now test our function
    console.log(`Now testing fetchProjectScreenshots function...`)
    const screenshots = await fetchProjectScreenshots(projectName)
    
    console.log(`Found ${screenshots.length} screenshots for ${projectName}`)
    screenshots.forEach((url, index) => {
      console.log(`  Screenshot ${index + 1}: ${url}`)
    })
    
    return NextResponse.json({
      success: true,
      project: projectName,
      screenshots,
      count: screenshots.length,
      directApiTest: 'completed'
    })
    
  } catch (error) {
    console.error('Test screenshots API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

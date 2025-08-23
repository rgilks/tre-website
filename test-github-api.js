// Standalone test for GitHub API screenshot fetching
const GITHUB_API_BASE = 'https://api.github.com'
const GITHUB_USERNAME = 'rgilks'

async function testGitHubAPI() {
  console.log('=== STANDALONE GITHUB API TEST ===')
  
  try {
    const projectName = 'geno-1'
    const path = 'docs/screenshot.png'
    const url = `${GITHUB_API_BASE}/repos/${GITHUB_USERNAME}/${projectName}/contents/${path}`
    
    console.log(`Testing URL: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'tre-website',
      }
    })
    
    console.log(`Response status: ${response.status}`)
    console.log(`Response ok: ${response.ok}`)
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const content = await response.json()
      console.log('Response content:', JSON.stringify(content, null, 2))
      
      if (content.download_url) {
        console.log(`✅ SUCCESS: Found download_url: ${content.download_url}`)
        
        // Test if the image URL is accessible
        const imageResponse = await fetch(content.download_url, { method: 'HEAD' })
        console.log(`Image accessible: ${imageResponse.ok}`)
        console.log(`Image size: ${imageResponse.headers.get('content-length')} bytes`)
      } else {
        console.log('❌ FAILED: No download_url in response')
      }
    } else {
      console.log(`❌ FAILED: Response not ok (${response.status})`)
      const errorText = await response.text()
      console.log('Error response:', errorText)
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error)
  }
}

testGitHubAPI()

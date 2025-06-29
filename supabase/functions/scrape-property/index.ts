import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapeRequest {
  url: string;
  openaiApiKey?: string;
}

interface PropertyData {
  title: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  address: string;
  description: string;
  features: string[];
  imageUrl: string;
  propertyType: string;
  yearBuilt?: number;
  neighborhood?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, openaiApiKey }: ScrapeRequest = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🔍 Starting scrape for: ${url}`)

    // Step 1: Try direct fetch first
    let htmlContent = ''
    let scrapingMethod = 'direct'

    try {
      console.log('📡 Attempting direct fetch...')
      const directResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (directResponse.ok) {
        htmlContent = await directResponse.text()
        console.log(`✅ Direct fetch successful, content length: ${htmlContent.length}`)
      } else {
        throw new Error(`Direct fetch failed: ${directResponse.status}`)
      }
    } catch (directError) {
      console.log(`❌ Direct fetch failed: ${directError.message}`)
      
      // Step 2: Fallback to ScraperAPI
      const scraperApiKey = Deno.env.get('SCRAPER_API_KEY')
      if (scraperApiKey) {
        try {
          console.log('🔄 Falling back to ScraperAPI...')
          const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}&render=true`
          
          const scraperResponse = await fetch(scraperUrl)
          if (scraperResponse.ok) {
            htmlContent = await scraperResponse.text()
            scrapingMethod = 'scraperapi'
            console.log(`✅ ScraperAPI successful, content length: ${htmlContent.length}`)
          } else {
            throw new Error(`ScraperAPI failed: ${scraperResponse.status}`)
          }
        } catch (scraperError) {
          console.log(`❌ ScraperAPI failed: ${scraperError.message}`)
          throw new Error('Both direct fetch and ScraperAPI failed')
        }
      } else {
        throw new Error('Direct fetch failed and no ScraperAPI key available')
      }
    }

    // Step 3: Process with OpenAI if API key is provided
    let extractedData: PropertyData | null = null
    
    if (openaiApiKey && htmlContent) {
      try {
        console.log('🤖 Processing with OpenAI...')
        extractedData = await extractPropertyDataWithOpenAI(htmlContent, url, openaiApiKey)
        console.log('✅ OpenAI extraction successful')
      } catch (openaiError) {
        console.log(`❌ OpenAI extraction failed: ${openaiError.message}`)
        // Continue without OpenAI data
      }
    }

    // Step 4: Fallback to basic extraction if OpenAI fails
    if (!extractedData) {
      console.log('🔧 Using fallback extraction...')
      extractedData = extractBasicPropertyData(htmlContent, url)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
        metadata: {
          scrapingMethod,
          contentLength: htmlContent.length,
          extractionMethod: openaiApiKey ? 'openai' : 'basic'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Scraping error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function extractPropertyDataWithOpenAI(
  htmlContent: string, 
  url: string, 
  apiKey: string
): Promise<PropertyData> {
  // Clean and truncate HTML content for OpenAI
  const cleanedHtml = htmlContent
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<!--.*?-->/gs, '')
    .substring(0, 8000) // Limit content size

  const prompt = `
Extract property information from this HTML content from ${url}.

HTML Content:
${cleanedHtml}

Please extract and return ONLY a valid JSON object with the following structure:
{
  "title": "Property title",
  "price": 450000,
  "currency": "EUR" or "USD",
  "bedrooms": 3,
  "bathrooms": 2,
  "sqft": 1200,
  "address": "Full address",
  "description": "Property description",
  "features": ["feature1", "feature2"],
  "imageUrl": "https://example.com/image.jpg",
  "propertyType": "apartment" | "house" | "condo" | "townhouse",
  "yearBuilt": 2020,
  "neighborhood": "Neighborhood name"
}

Rules:
- Return ONLY valid JSON, no additional text
- Use realistic values based on the content
- If information is missing, use reasonable defaults
- Currency should be EUR for European sites, USD for others
- Property type should be one of: apartment, house, condo, townhouse
- Features should be an array of strings
- Use a placeholder image URL if no image is found
`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.1
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const result = await response.json()
  const content = result.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content returned from OpenAI')
  }

  try {
    return JSON.parse(content)
  } catch (parseError) {
    throw new Error('Failed to parse OpenAI response as JSON')
  }
}

function extractBasicPropertyData(htmlContent: string, url: string): PropertyData {
  const domain = new URL(url).hostname
  const isEuropean = domain.includes('idealista') || 
                    domain.includes('fotocasa') || 
                    domain.includes('.es') || 
                    domain.includes('.fr') || 
                    domain.includes('.de')

  // Basic extraction logic
  const title = extractTextBetween(htmlContent, '<title>', '</title>') || 
                `Propiedad importada desde ${domain}`

  const currency = isEuropean ? 'EUR' : 'USD'
  const basePrice = isEuropean ? 450000 : 500000

  return {
    title: title.substring(0, 100),
    price: basePrice,
    currency,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    address: url,
    description: `Propiedad importada desde ${url}. Los datos han sido extraídos automáticamente y pueden necesitar revisión.`,
    features: ['Importada automáticamente', 'Requiere verificación'],
    imageUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    propertyType: 'apartment',
    yearBuilt: 2020,
    neighborhood: 'Por definir'
  }
}

function extractTextBetween(text: string, start: string, end: string): string | null {
  const startIndex = text.indexOf(start)
  if (startIndex === -1) return null
  
  const contentStart = startIndex + start.length
  const endIndex = text.indexOf(end, contentStart)
  if (endIndex === -1) return null
  
  return text.substring(contentStart, endIndex).trim()
}
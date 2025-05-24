// app/api/analyze/route.ts
import { NextResponse } from 'next/server'
import { AnalysisRequest, AnalysisResponse } from '@/app/types'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    const { location, locationName, analysisType } = await request.json() as AnalysisRequest
    
    if (!location || !locationName || !analysisType) {
      return NextResponse.json({ 
        error: 'Missing required parameters',
        analysis: '',
        suggestedLocations: [] 
      } as AnalysisResponse, { status: 400 })
    }
    
    let prompt = ''
    switch (analysisType) {
      case 'tourism':
        prompt = `Analyze ${locationName} (coordinates: ${location.lat}, ${location.lng}) as a tourism destination. Consider attractions, best times to visit, and potential activities. Also suggest 5 specific nearby points of interest that tourists should visit, including what type of attraction each one is (museum, park, restaurant, etc.).

Format your response as JSON with two fields:
1. "analysis" - Detailed text about the tourism potential of the location
2. "suggestedLocations" - An array of 5 objects, each with name, lat, lng, and attractionType properties

Example of expected format:
{
  "analysis": "Your detailed analysis here...",
  "suggestedLocations": [
    {
      "name": "Example Attraction",
      "lat": 43.12345,
      "lng": -79.12345,
      "attractionType": "Museum"
    },
    ...4 more locations
  ]
}

Make sure to include specific lat/lng coordinates for each suggested location that are near the main location but slightly different from the original coordinates.`
        break
      case 'realestate':
        prompt = `Analyze the real estate market in ${locationName} (coordinates: ${location.lat}, ${location.lng}). Consider property values, neighborhood amenities, and investment potential. Also suggest 5 specific nearby areas that might be good for real estate investment, including what type of property each one is (residential area, commercial district, new development, etc.).

Format your response as JSON with two fields:
1. "analysis" - Detailed text about the real estate market of the location
2. "suggestedLocations" - An array of 5 objects, each with name, lat, lng, and attractionType properties

Example of expected format:
{
  "analysis": "Your detailed analysis here...",
  "suggestedLocations": [
    {
      "name": "Example Property Area",
      "lat": 43.12345,
      "lng": -79.12345,
      "attractionType": "Residential Zone"
    },
    ...4 more locations
  ]
}

Make sure to include specific lat/lng coordinates for each suggested location that are near the main location but slightly different from the original coordinates.`
        break
      case 'environment':
        prompt = `Provide an environmental assessment of ${locationName} (coordinates: ${location.lat}, ${location.lng}). Consider air quality, green spaces, and sustainability factors. Also identify 5 specific nearby locations of environmental significance, including what type of environmental feature each one is (park, conservation area, green initiative, etc.).

Format your response as JSON with two fields:
1. "analysis" - Detailed text about the environmental aspects of the location
2. "suggestedLocations" - An array of 5 objects, each with name, lat, lng, and attractionType properties

Example of expected format:
{
  "analysis": "Your detailed analysis here...",
  "suggestedLocations": [
    {
      "name": "Example Environmental Feature",
      "lat": 43.12345,
      "lng": -79.12345,
      "attractionType": "Conservation Area"
    },
    ...4 more locations
  ]
}

Make sure to include specific lat/lng coordinates for each suggested location that are near the main location but slightly different from the original coordinates.`
        break
      default:
        prompt = `Analyze ${locationName} (coordinates: ${location.lat}, ${location.lng}) and provide useful insights. Also suggest 5 specific points of interest nearby, including what type of place each one is.

Format your response as JSON with two fields:
1. "analysis" - Detailed text about the location
2. "suggestedLocations" - An array of 5 objects, each with name, lat, lng, and attractionType properties

Example of expected format:
{
  "analysis": "Your detailed analysis here...",
  "suggestedLocations": [
    {
      "name": "Example Location",
      "lat": 43.12345,
      "lng": -79.12345,
      "attractionType": "Type of Place"
    },
    ...4 more locations
  ]
}

Make sure to include specific lat/lng coordinates for each suggested location that are near the main location but slightly different from the original coordinates.`
    }
    
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
      throw new Error('Gemini API key is not configured')
    }
    
    const genAI = new GoogleGenerativeAI(apiKey)
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest"
    })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const textContent = response.text()
    
    let parsedContent
    try {
      let cleanedContent = textContent
      
      if (textContent.includes('```')) {
        cleanedContent = textContent.replace(/```json\n/, '')
        cleanedContent = cleanedContent.replace(/```\s*$/, '')
      }
      
      parsedContent = JSON.parse(cleanedContent)
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', textContent)
      throw new Error('Invalid response format from Gemini')
    }
    
    if (!parsedContent.analysis || !Array.isArray(parsedContent.suggestedLocations)) {
      throw new Error('Response from Gemini does not have the expected format')
    }
    
    const suggestedLocations = parsedContent.suggestedLocations.map((loc: { lat: any; lng: any }, index: number) => {
      if (!loc.lat || !loc.lng) {
        const offsetLat = 0.002 * (index + 1) * (index % 2 === 0 ? 1 : -1)
        const offsetLng = 0.003 * (index + 1) * (index % 3 === 0 ? 1 : -1)
        
        return {
          ...loc,
          lat: location.lat + offsetLat,
          lng: location.lng + offsetLng
        }
      }
      return loc
    })
    
    return NextResponse.json({ 
      analysis: parsedContent.analysis,
      suggestedLocations
    } as AnalysisResponse)
    
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate analysis',
      analysis: '',
      suggestedLocations: [] 
    } as AnalysisResponse, { status: 500 })
  }
}
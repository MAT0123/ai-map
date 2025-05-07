"use client"

import { useState } from 'react'
import dynamic from 'next/dynamic'
import LocationSearch from '@/app/components/LocationSearch'
import AIAnalyzer from '@/app/components/AIAnalyzer'
import { Location, Marker, SuggestedLocation } from '@/app/types'

// Import map component dynamically to avoid SSR issues
const MapComponent = dynamic(() => import('@/app/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[70vh] w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
})

export default function Home() {
  // Set initial location to Yonge & Lawrence in Toronto
  const [location, setLocation] = useState<Location>({ 
    lat: 43.725092, 
    lng: -79.402195 
  }) 
  
  const [locationName, setLocationName] = useState<string>('Yonge & Lawrence, Toronto')
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [markers, setMarkers] = useState<Marker[]>([
    {
      position: { lat: 43.725092, lng: -79.402195 },
      name: 'Yonge & Lawrence, Toronto',
      type: 'primary'
    }
  ])

  const handleLocationFound = async (loc: Location, name: string) => {
    setLocation(loc)
    setLocationName(name)
    
    // Reset markers and add the new location
    setMarkers([{
      position: loc,
      name: name,
      type: 'primary'
    }])

    // Clear previous analysis
    setAiAnalysis('')
    setLoading(false) // Make sure loading is false after search
  }

  const handleAIAnalysis = (analysis: string, suggestedLocations: SuggestedLocation[]) => {
    setAiAnalysis(analysis)
    
    // Add suggested locations as markers
    if (suggestedLocations && suggestedLocations.length) {
      const newMarkers: Marker[] = suggestedLocations.map(loc => ({
        position: { lat: loc.lat, lng: loc.lng },
        name: loc.name,
        type: 'suggestion'
      }))
      
      // Keep the primary marker and add suggestions
      setMarkers([...markers.filter(m => m.type === 'primary'), ...newMarkers])
    }
    
    setLoading(false) // Ensure loading is set to false
  }

  // Add a new function to handle when analysis starts
  const handleAnalysisStart = () => {
    setLoading(true)
  }

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">AI-Powered Location Explorer</h1>
      
      <div className="mb-6">
        <LocationSearch onLocationFound={handleLocationFound} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapComponent 
            center={location} 
            zoom={15} // Set a higher zoom level for better initial view
            markers={markers}
          />
        </div>
        
        <div>
          <AIAnalyzer 
            location={location}
            locationName={locationName}
            onAnalysisComplete={handleAIAnalysis}
            onAnalysisStart={handleAnalysisStart} // Pass the new handler
            loading={loading}
            analysis={aiAnalysis}
          />
        </div>
      </div>
    </main>
  )
}
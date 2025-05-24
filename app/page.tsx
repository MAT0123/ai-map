"use client"

import { useState } from 'react'
import dynamic from 'next/dynamic'
import LocationSearch from '@/app/components/LocationSearch'
import AIAnalyzer from '@/app/components/AIAnalyzer'
import { Location, Marker, SuggestedLocation } from '@/app/types'

const MapComponent = dynamic(() => import('@/app/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[70vh] w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
})

export default function Home() {
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
    
    setMarkers([{
      position: loc,
      name: name,
      type: 'primary'
    }])

    setAiAnalysis('')
    setLoading(false) 
  }

  const handleAIAnalysis = (analysis: string, suggestedLocations: SuggestedLocation[]) => {
    setAiAnalysis(analysis)
    
    if (suggestedLocations && suggestedLocations.length) {
      const newMarkers: Marker[] = suggestedLocations.map(loc => ({
        position: { lat: loc.lat, lng: loc.lng },
        name: loc.name,
        type: 'suggestion'
      }))
      
      setMarkers([...markers.filter(m => m.type === 'primary'), ...newMarkers])
    }
    
    setLoading(false) 
  }

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
            zoom={15} 
            markers={markers}
          />
        </div>
        
        <div>
          <AIAnalyzer 
            location={location}
            locationName={locationName}
            onAnalysisComplete={handleAIAnalysis}
            onAnalysisStart={handleAnalysisStart} 
            loading={loading}
            analysis={aiAnalysis}
          />
        </div>
      </div>
    </main>
  )
}
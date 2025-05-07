"use client"

import { useState } from 'react'
import { Location, AnalysisType, SuggestedLocation } from '../types'

interface AIAnalyzerProps {
  location: Location;
  locationName: string;
  onAnalysisComplete: (analysis: string, suggestedLocations: SuggestedLocation[]) => void;
  onAnalysisStart?: () => void;
  loading: boolean;
  analysis: string;
}

export default function AIAnalyzer({ 
  location, 
  locationName, 
  onAnalysisComplete, 
  onAnalysisStart,
  loading,
  analysis 
}: AIAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState<boolean>(false)
  const [analysisType, setAnalysisType] = useState<AnalysisType>('tourism')
  const [error, setError] = useState<string | null>(null)

  const getAnalysis = async () => {
    if (!location || !locationName) return
    
    // Signal that analysis is starting
    if (onAnalysisStart) {
      onAnalysisStart();
    }
    
    setAnalyzing(true)
    setError(null)
    
    try {
      // Call the API endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location,
          locationName,
          analysisType
        }),
      })
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      // Process the real AI-generated data
      onAnalysisComplete(data.analysis, data.suggestedLocations)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      // Use fallback data in case of error
      onAnalysisComplete(
        `Unable to analyze ${locationName} due to an error. Please try again later.`,
        []
      )
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
      
      {locationName ? (
        <>
          <div className="mb-4">
            <p className="text-gray-700 mb-2">Selected location:</p>
            <p className="font-medium">{locationName}</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Analysis Type:</label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={analyzing || loading}
            >
              <option value="tourism">Tourism Potential</option>
              <option value="realestate">Real Estate Market</option>
              <option value="environment">Environmental Assessment</option>
            </select>
          </div>
          
          <button
            onClick={getAnalysis}
            disabled={analyzing || loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded disabled:bg-green-400 mb-4"
          >
            {analyzing || loading ? 'Processing...' : 'Analyze Location'}
          </button>
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {analysis && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Analysis Results:</h3>
              <p className="text-gray-800">{analysis}</p>
              
              <div className="mt-3 text-sm text-gray-600">
                <p className="font-medium">AI has identified points of interest marked on the map.</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-500 italic">
          Search for a location to begin AI analysis
        </div>
      )}
    </div>
  )
}
"use client"

import { useState } from 'react'
import axios from 'axios'
import { Location } from '../types'

interface LocationSearchProps {
  onLocationFound: (location: Location, name: string) => void;
}

export default function LocationSearch({ onLocationFound }: LocationSearchProps) {
  const [query, setQuery] = useState<string>('')
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setIsSearching(true)
    setError(null)
    
    try {
      // Using OpenStreetMap Nominatim for geocoding
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: 'json',
          limit: 1
        }
      })
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0]
        const location: Location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        }
        onLocationFound(location, result.display_name)
      } else {
        setError('Location not found. Please try a different search term.')
      }
    } catch (err) {
      setError('Error searching for location. Please try again.')
      console.error('Geocoding error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={searchLocation} className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a location (city, address, landmark...)"
          className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-lg disabled:bg-blue-400"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">{error}</div>
      )}
    </div>
  )
}
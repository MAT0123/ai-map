"use client"

import { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Location, Marker as MarkerType } from '../types'

// Fix Leaflet marker icon issue in Next.js
const createIcon = (type: 'primary' | 'suggestion') => {
  return new L.Icon({
    iconUrl: type === 'primary' 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

interface ChangeViewProps {
  center: Location;
  zoom: number;
}

// Component to update map view when center changes
function ChangeView({ center, zoom }: ChangeViewProps) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

interface MapComponentProps {
  center: Location;
  zoom?: number;
  markers?: MarkerType[];
}

export default function MapComponent({ 
  center, 
  zoom = 13, 
  markers = [] 
}: MapComponentProps) {
  // Add state to track if component is mounted (client-side)
  const [isMounted, setIsMounted] = useState<boolean>(false)
  
  // Set mounted state to true after component mounts
  useEffect(() => {
    setIsMounted(true)
    return () => {
      setIsMounted(false)
    }
  }, [])

  // Initialize default markers if none provided
  const displayMarkers = useMemo((): MarkerType[] => {
    if (markers.length === 0 && center) {
      return [{
        position: center,
        name: 'Selected Location',
        type: 'primary'
      }]
    }
    return markers
  }, [markers, center])

  // Only render the map on the client-side to avoid the initialization error
  if (!isMounted) {
    return <div className="h-[70vh] w-full bg-gray-200 rounded-lg flex items-center justify-center">Loading Map...</div>
  }

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={true} 
      key={`${center.lat}-${center.lng}`}
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {displayMarkers.map((marker, index) => (
        <Marker 
          key={`marker-${index}`}
          position={marker.position}
          icon={createIcon(marker.type)}
        >
          <Popup>
            <div>
              <h3 className="font-semibold">{marker.name || 'Location'}</h3>
              <p className="text-sm">
                Lat: {marker.position.lat.toFixed(6)}, 
                Lng: {marker.position.lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
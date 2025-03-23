'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'
import type { Disaster } from './disaster-dashboard'
import { DisasterModal } from './disaster-modal'
import { GOOGLE_MAPS_CONFIG } from '@/lib/google-maps'

// This would normally come from an environment variable
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID
interface DisasterMapProps {
  disasters: Disaster[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  categories: string[]
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.375rem', // equivalent to rounded-md
}

const defaultCenter = {
  lat: 20,
  lng: 0,
}

const mapOptions = {
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }],
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }],
    },
  ],
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  mapId: GOOGLE_MAPS_ID,
}

// Declare google variable
declare global {
  interface Window {
    google: any
  }
}

export function DisasterMap({
  disasters,
  selectedCategory,
  onCategoryChange,
  categories,
}: DisasterMapProps) {
  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_CONFIG)

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [completion, setCompletion] = useState<string | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const geocoder = useRef<google.maps.Geocoder | null>(null)
  const processedDisastersRef = useRef<Set<string>>(new Set())

  // Filter disasters based on selected category
  const filteredDisasters =
    selectedCategory === 'All'
      ? disasters
      : disasters.filter((d) => d.disasterType === selectedCategory)

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    geocoder.current = new window.google.maps.Geocoder()
  }, [])

  const onUnmount = useCallback(() => {
    // Clean up markers
    markersRef.current.forEach((marker) => {
      if (marker) {
        marker.map = null
      }
    })
    markersRef.current = []
    setMap(null)
    geocoder.current = null
    processedDisastersRef.current.clear()
  }, [])

  // Function to get coordinates from location string
  const getCoordinatesFromLocation = async (
    disaster: Disaster
  ): Promise<{ lat: number; lng: number } | null> => {
    if (!geocoder.current) return null

    // If we already have coordinates, use them
    if (disaster.latitude && disaster.longitude) {
      return { lat: disaster.latitude, lng: disaster.longitude }
    }

    // Extract the first location (usually a city) from the location string
    const locationParts = disaster.location.split(',')
    const firstLocation = locationParts[0].trim()

    // If no location information, try using the country
    if (!firstLocation && !disaster.country) return null

    const searchQuery = `${firstLocation}, ${disaster.country}`

    try {
      const response = await geocoder.current.geocode({ address: searchQuery })
      if (response.results && response.results[0]?.geometry?.location) {
        const location = response.results[0].geometry.location
        return { lat: location.lat(), lng: location.lng() }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
    return null
  }

  // Function to handle marker click
  const handleMarkerClick = useCallback((disaster: Disaster) => {
    setSelectedDisaster(disaster)
    setIsModalOpen(true)
  }, [])

  // Function to create a marker for a disaster
  const createMarker = useCallback(
    (disaster: Disaster, coordinates: { lat: number; lng: number }) => {
      if (!map) return null

      const markerDiv = document.createElement('div')
      markerDiv.className = 'marker-pin'
      markerDiv.style.width = '24px'
      markerDiv.style.height = '24px'
      markerDiv.style.borderRadius = '50%'
      markerDiv.style.backgroundColor = '#ef4444' // Tailwind red-500
      markerDiv.style.opacity = '0.7'
      markerDiv.style.border = '2px solid white'
      markerDiv.style.cursor = 'pointer'
      markerDiv.style.transition = 'opacity 0.2s'

      // Hover effect
      markerDiv.onmouseover = () => {
        markerDiv.style.opacity = '1'
      }
      markerDiv.onmouseout = () => {
        markerDiv.style.opacity = '0.7'
      }

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: coordinates,
        content: markerDiv,
        map: map,
        title: disaster.eventName || disaster.disasterType,
      })

      // Use the separate click handler
      marker.addListener('click', () => handleMarkerClick(disaster))

      return marker
    },
    [map] // Only depend on map and click handler
  )

  // Create and add markers when disasters or map changes
  useEffect(() => {
    if (!map || !isLoaded || !window.google || !geocoder.current) return

    let isMounted = true // Add mounted flag

    // Clear existing markers and processed disasters set
    markersRef.current.forEach((marker) => {
      if (marker) {
        marker.map = null
      }
    })
    markersRef.current = []
    processedDisastersRef.current.clear()

    const bounds = new window.google.maps.LatLngBounds()
    let markersAdded = 0

    // Process disasters and add markers
    const processDisasters = async () => {
      for (const disaster of filteredDisasters) {
        if (!isMounted) return // Check if still mounted

        // Skip if already processed
        if (processedDisastersRef.current.has(disaster.id)) continue

        const coordinates = await getCoordinatesFromLocation(disaster)
        if (!coordinates) continue

        const marker = createMarker(disaster, coordinates)
        if (marker) {
          markersRef.current.push(marker)
          bounds.extend(coordinates)
          markersAdded++
          processedDisastersRef.current.add(disaster.id)
        }
      }

      if (!isMounted) return // Check if still mounted

      // Fit bounds if we have markers
      if (markersAdded > 0 && markersAdded < 1000) {
        map.fitBounds(bounds, 50) // 50px padding

        // Don't zoom in too far on small datasets
        const listener = window.google.maps.event.addListener(
          map,
          'idle',
          () => {
            if (!isMounted) return // Check if still mounted
            const zoom = map.getZoom()
            if (zoom && zoom > 10) {
              map.setZoom(10)
            }
            window.google.maps.event.removeListener(listener)
          }
        )
      }
    }

    processDisasters()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [map, filteredDisasters, isLoaded, createMarker]) // Dependencies don't include modal state

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-destructive/10 p-6 rounded-lg max-w-lg">
          <h2 className="text-xl font-bold text-destructive mb-2">
            Error Loading Google Maps
          </h2>
          <p>
            Could not load the map. Please check your API key and try again.
          </p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <div className="absolute top-4 left-4 right-4 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg shadow-lg p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => onCategoryChange('All')}
          className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
            selectedCategory === 'All'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          All Types
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-3 py-1.5 text-sm rounded-md whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={2}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      />
      <DisasterModal
        disaster={selectedDisaster}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDisaster(null)
        }}
        allDisasters={disasters}
        selectedCategory={selectedCategory}
      />
    </div>
  )
}

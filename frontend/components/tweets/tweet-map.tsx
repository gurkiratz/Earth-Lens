'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api'

interface DisasterTweet {
  location: string
  category: string
  tweet: string
  location1: string
  latitude: number
  longitude: number
  datetime: string
  multimodal: boolean
  file_path?: string | null
  Disaster_Category: string
  Relevancy: boolean
  Priority: number
  media_description?: string | null
  summary: string
  responders_required: string[]
}

interface TweetMapProps {
  selectedTweet: DisasterTweet | null
  tweets: DisasterTweet[]
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.375rem',
}

const defaultCenter = {
  lat: 34.0522,
  lng: -118.2437, // Los Angeles center
}

const mapOptions = {
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
}

export default function TweetMap({ selectedTweet, tweets }: TweetMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(
    null
  )

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    setInfoWindow(new window.google.maps.InfoWindow())
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
    setMarkers([])
    setInfoWindow(null)
  }, [])

  useEffect(() => {
    if (!map || !tweets.length) return

    // Clear existing markers
    markers.forEach((marker: google.maps.Marker) => marker.setMap(null))
    const newMarkers: google.maps.Marker[] = []

    // Add markers for all tweets
    tweets.forEach((tweet) => {
      const marker = new window.google.maps.Marker({
        position: { lat: tweet.latitude, lng: tweet.longitude },
        map: map,
        title: tweet.summary,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor:
            tweet.Priority === 1
              ? '#ef4444'
              : tweet.Priority === 2
              ? '#eab308'
              : '#22c55e',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      })

      // Add click listener
      marker.addListener('click', () => {
        if (infoWindow) {
          infoWindow.setContent(`
            <div class="p-2">
              <h3 class="font-medium">${tweet.category}</h3>
              <p class="text-sm text-muted-foreground">${tweet.summary}</p>
              <p class="text-xs text-muted-foreground mt-1">${tweet.location}</p>
            </div>
          `)
          infoWindow.open(map, marker)
        }
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)

    // If there's a selected tweet, center the map on it
    if (selectedTweet) {
      const position = {
        lat: selectedTweet.latitude,
        lng: selectedTweet.longitude,
      }
      map.panTo(position)
      map.setZoom(12)
    }
  }, [map, tweets, selectedTweet, infoWindow])

  if (loadError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-destructive">Error loading map</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      options={mapOptions}
      onLoad={onLoad}
      onUnmount={onUnmount}
      zoom={10}
      center={defaultCenter}
    />
  )
}

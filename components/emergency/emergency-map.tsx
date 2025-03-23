'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  Flame,
  Ambulance,
  Shield,
  Phone,
  Wind,
  Cloud,
  Users,
  AlertTriangle,
} from 'lucide-react'
import { GOOGLE_MAPS_CONFIG } from '@/lib/google-maps'

interface EmergencyTicket {
  ticket_id: string
  name: string
  location: string
  datetime: string
  status: string
  priority: string
  summary: string
  life_threatening: boolean
  breathing_issue: string
  fire_visibility: string
  smoke_visibility: string
  help_for_whom: string[]
  services_needed: string[]
  ticket_type: string
}

interface EmergencyMapProps {
  selectedTicket: EmergencyTicket | null
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.375rem',
}

const defaultCenter = {
  lat: 43.6532,
  lng: -79.3832, // Default to Toronto
}

const mapOptions = {
  styles: [
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6c757d' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#6c757d' }],
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f8f9fa' }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#e9ecef' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#dee2e6' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#adb5bd' }],
    },
  ],
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
}

declare global {
  interface Window {
    google: any
  }
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export default function EmergencyMap({ selectedTicket }: EmergencyMapProps) {
  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_CONFIG)

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLng | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const [currentLocation, setCurrentLocation] = useState<string | null>(null)

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    geocoderRef.current = new window.google.maps.Geocoder()
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
    setMarkerPosition(null)
    geocoderRef.current = null
  }, [])

  // Function to get coordinates from location string
  const getCoordinatesFromLocation = async (
    location: string
  ): Promise<google.maps.LatLng | null> => {
    if (!geocoderRef.current) return null

    try {
      const response = await geocoderRef.current.geocode({ address: location })
      if (response.results && response.results[0]?.geometry?.location) {
        return response.results[0].geometry.location
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
    return null
  }

  // Update marker when selected ticket changes
  useEffect(() => {
    if (!map || !selectedTicket || !geocoderRef.current) return

    // If location hasn't changed, don't update
    if (currentLocation === selectedTicket.location) return

    setCurrentLocation(selectedTicket.location)

    const updateMarker = async () => {
      const position = await getCoordinatesFromLocation(selectedTicket.location)
      if (!position) return

      setMarkerPosition(position)

      // Create bounds and extend with marker position
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(position)

      // Fit map to bounds with padding
      map.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      })

      // Set maximum zoom level
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom()! > 15) {
          map.setZoom(15)
        }
        window.google.maps.event.removeListener(listener)
      })
    }

    updateMarker()
  }, [map, selectedTicket, currentLocation])

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'fire':
        return <Flame className="h-4 w-4" />
      case 'ambulance':
        return <Ambulance className="h-4 w-4" />
      case 'police':
        return <Shield className="h-4 w-4" />
      default:
        return <Phone className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const handleMarkerClick = useCallback(() => {
    if (!selectedTicket) return

    console.log('Selected ticket:', selectedTicket)

    toast(
      <div className="flex flex-col gap-3 p-1">
        <div className="flex flex-col justify-between">
          <div className="font-semibold">
            Emergency #{selectedTicket.ticket_id}
          </div>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={getPriorityColor(selectedTicket.priority)}
            >
              {selectedTicket.priority?.toUpperCase() || 'UNKNOWN'} PRIORITY
            </Badge>
            {selectedTicket.life_threatening && (
              <Badge
                variant="outline"
                className="bg-red-500/10 text-red-500 border-red-500/20"
              >
                LIFE THREATENING
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {/* Emergency Details */}
          <div className="space-y-2">
            {selectedTicket.breathing_issue && (
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-muted-foreground" />
                <span>Breathing Issue: {selectedTicket.breathing_issue}</span>
              </div>
            )}

            {selectedTicket.fire_visibility && (
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-muted-foreground" />
                <span>Fire Visibility: {selectedTicket.fire_visibility}</span>
              </div>
            )}

            {selectedTicket.smoke_visibility && (
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-muted-foreground" />
                <span>Smoke Visibility: {selectedTicket.smoke_visibility}</span>
              </div>
            )}

            {selectedTicket.help_for_whom &&
              selectedTicket.help_for_whom.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Help For: {selectedTicket.help_for_whom.join(', ')}
                  </span>
                </div>
              )}
          </div>

          {/* Services Needed */}
          {selectedTicket.services_needed &&
            selectedTicket.services_needed.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Services Needed</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTicket.services_needed.map((service) => (
                    <Badge
                      key={service}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {getServiceIcon(service)}
                      <span>{service}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          <div className="pt-2">
            <span className="font-medium">Location: </span>
            {selectedTicket.location}
          </div>
        </div>
      </div>,
      {
        duration: 6000,
        position: 'top-right',
        className: 'emergency-toast',
        icon: selectedTicket.life_threatening ? '🚨' : '🚑',
      }
    )
  }, [selectedTicket])

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-destructive">Google Maps API key not configured</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-destructive">
          Error loading map: {loadError.message}
        </p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
        zoom={12}
        center={defaultCenter}
      >
        {markerPosition && (
          <MarkerF
            position={markerPosition}
            onClick={handleMarkerClick}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: selectedTicket?.life_threatening
                ? '#ef4444'
                : '#3b82f6',
              fillOpacity: 0.9,
              strokeWeight: 2,
              strokeColor: '#ffffff',
            }}
          />
        )}
      </GoogleMap>
    </div>
  )
}

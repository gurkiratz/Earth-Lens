import { LoadScriptProps } from '@react-google-maps/api'

// Shared Google Maps configuration
export const GOOGLE_MAPS_CONFIG: LoadScriptProps = {
  id: 'google-map-script',
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: 'weekly',
  language: 'en',
  region: 'US',
  libraries: ['marker', 'geocoding'],
}

export const defaultMapOptions = {
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

export const defaultCenter = {
  lat: 34.0522,
  lng: -118.2437, // Los Angeles center
}

export const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.375rem',
}

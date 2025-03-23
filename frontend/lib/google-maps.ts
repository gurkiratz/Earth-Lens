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

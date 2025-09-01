import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { MapPin, Navigation } from 'lucide-react'

interface Location {
  lat: number
  lng: number
}

interface MapComponentProps {
  fishermanLocation?: Location | null
  buyerLocation?: Location | null
  showRoute?: boolean
  onLocationSelect?: (location: Location) => void
  height?: string
}

const MapComponent = ({ 
  fishermanLocation, 
  buyerLocation, 
  showRoute = false, 
  onLocationSelect,
  height = "400px" 
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [mapboxToken, setMapboxToken] = useState("")
  const [map, setMap] = useState<any>(null)
  const [distance, setDistance] = useState<string>("")
  const [duration, setDuration] = useState<string>("")

  useEffect(() => {
    // For demo purposes, using a placeholder token
    // In production, this should come from Supabase secrets
    const token = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
    setMapboxToken(token)
  }, [])

  useEffect(() => {
    if (!mapboxToken || !mapRef.current) return

    // Create a simple map placeholder since we can't use actual Mapbox without proper token
    const mapContainer = mapRef.current
    mapContainer.innerHTML = ''
    
    const mapDiv = document.createElement('div')
    mapDiv.className = 'relative w-full h-full bg-slate-100 rounded-lg flex items-center justify-center'
    mapDiv.style.height = height
    
    // Create map content
    const mapContent = document.createElement('div')
    mapContent.className = 'text-center p-6'
    
    if (fishermanLocation && buyerLocation) {
      mapContent.innerHTML = `
        <div class="space-y-4">
          <div class="flex justify-center items-center gap-4 mb-4">
            <div class="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-lg">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span class="text-sm font-medium">Fisherman</span>
            </div>
            <div class="flex-1 border-t-2 border-dashed border-gray-300"></div>
            <div class="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-sm font-medium">Buyer</span>
            </div>
          </div>
          <div class="text-lg font-semibold text-gray-700">Route Overview</div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="bg-white p-3 rounded-lg">
              <div class="font-medium">Distance</div>
              <div class="text-lg font-bold text-primary">~12.5 km</div>
            </div>
            <div class="bg-white p-3 rounded-lg">
              <div class="font-medium">ETA</div>
              <div class="text-lg font-bold text-primary">~25 mins</div>
            </div>
          </div>
        </div>
      `
    } else if (fishermanLocation || buyerLocation) {
      const locationType = fishermanLocation ? 'Fisherman' : 'Buyer'
      mapContent.innerHTML = `
        <div class="space-y-4">
          <div class="flex justify-center">
            <div class="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
              <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span class="font-medium">${locationType} Location</span>
            </div>
          </div>
          <div class="text-gray-600">Location marked on map</div>
        </div>
      `
    } else {
      mapContent.innerHTML = `
        <div class="space-y-4">
          <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <div class="text-gray-600">Map will show delivery route</div>
          <div class="text-sm text-gray-500">Location tracking available</div>
        </div>
      `
    }
    
    mapDiv.appendChild(mapContent)
    mapContainer.appendChild(mapDiv)

    // Add click handler for location selection
    if (onLocationSelect) {
      mapDiv.addEventListener('click', (e) => {
        const rect = mapDiv.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        // Convert click position to mock coordinates
        const lat = 12.9716 + (y / rect.height - 0.5) * 0.1
        const lng = 77.5946 + (x / rect.width - 0.5) * 0.1
        
        onLocationSelect({ lat, lng })
        toast({ title: "Location Selected", description: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}` })
      })
    }

    return () => {
      if (mapContainer) {
        mapContainer.innerHTML = ''
      }
    }
  }, [mapboxToken, fishermanLocation, buyerLocation, showRoute, onLocationSelect, height])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          onLocationSelect?.(location)
          toast({ title: "Location Found", description: "Your current location has been set" })
        },
        () => {
          toast({ title: "Error", description: "Unable to get your location", variant: "destructive" })
        }
      )
    } else {
      toast({ title: "Error", description: "Geolocation is not supported", variant: "destructive" })
    }
  }

  return (
    <div className="relative w-full">
      <div ref={mapRef} className="w-full" style={{ height }} />
      
      {onLocationSelect && (
        <button
          onClick={getCurrentLocation}
          className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          title="Get Current Location"
        >
          <Navigation className="h-4 w-4" />
        </button>
      )}
      
      {showRoute && fishermanLocation && buyerLocation && (
        <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm p-3 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Route Info:</span>
            <div className="flex gap-4">
              <span>Distance: ~12.5 km</span>
              <span>ETA: ~25 mins</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapComponent
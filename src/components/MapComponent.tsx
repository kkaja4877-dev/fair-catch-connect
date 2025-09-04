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

  useEffect(() => {
    if (!mapRef.current) return

    // Create a map placeholder with enhanced safety
    const mapContainer = mapRef.current
    mapContainer.innerHTML = ''
    
    const mapDiv = document.createElement('div')
    mapDiv.className = 'relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border border-blue-200'
    mapDiv.style.height = height
    
    // Create map content with null safety
    const mapContent = document.createElement('div')
    mapContent.className = 'text-center p-6'
    
    const hasValidFishermanLocation = fishermanLocation?.lat && fishermanLocation?.lng
    const hasValidBuyerLocation = buyerLocation?.lat && buyerLocation?.lng
    
    if (hasValidFishermanLocation && hasValidBuyerLocation) {
      mapContent.innerHTML = `
        <div class="space-y-4">
          <div class="flex justify-center items-center gap-4 mb-4">
            <div class="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-lg border border-blue-200">
              <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span class="text-sm font-medium text-blue-800">Fisherman/Supplier</span>
            </div>
            <div class="flex-1 border-t-2 border-dashed border-blue-300 relative">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="bg-blue-200 px-2 py-1 rounded text-xs text-blue-600">Route</div>
              </div>
            </div>
            <div class="flex items-center gap-2 bg-green-100 px-3 py-2 rounded-lg border border-green-200">
              <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm font-medium text-green-800">Buyer</span>
            </div>
          </div>
          <div class="text-lg font-semibold text-gray-700">Live Route Tracking</div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="bg-white/70 backdrop-blur-sm p-3 rounded-lg border">
              <div class="font-medium text-gray-600">Estimated Distance</div>
              <div class="text-lg font-bold text-primary">~12.5 km</div>
            </div>
            <div class="bg-white/70 backdrop-blur-sm p-3 rounded-lg border">
              <div class="font-medium text-gray-600">Estimated Time</div>
              <div class="text-lg font-bold text-primary">~25 mins</div>
            </div>
          </div>
          <div class="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded">
            Coordinates: ${fishermanLocation.lat.toFixed(4)}, ${fishermanLocation.lng.toFixed(4)} → ${buyerLocation.lat.toFixed(4)}, ${buyerLocation.lng.toFixed(4)}
          </div>
        </div>
      `
    } else if (hasValidFishermanLocation || hasValidBuyerLocation) {
      const locationType = hasValidFishermanLocation ? 'Fisherman/Supplier' : 'Buyer'
      const location = hasValidFishermanLocation ? fishermanLocation : buyerLocation
      const colorClass = hasValidFishermanLocation ? 'blue' : 'green'
      
      mapContent.innerHTML = `
        <div class="space-y-4">
          <div class="flex justify-center">
            <div class="flex items-center gap-2 bg-${colorClass}-100 px-4 py-2 rounded-lg border border-${colorClass}-200">
              <div class="w-4 h-4 bg-${colorClass}-500 rounded-full animate-pulse"></div>
              <span class="font-medium text-${colorClass}-800">${locationType} Location</span>
            </div>
          </div>
          <div class="text-gray-600">Location marked on map</div>
          <div class="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded">
            Coordinates: ${location?.lat?.toFixed(4)}, ${location?.lng?.toFixed(4)}
          </div>
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
          <div class="text-gray-600 font-medium">No Location Data Available</div>
          <div class="text-sm text-gray-500">Location coordinates will appear when delivery starts</div>
          <div class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
            Waiting for location tracking...
          </div>
        </div>
      `
    }
    
    mapDiv.appendChild(mapContent)
    mapContainer.appendChild(mapDiv)

    // Add click handler for location selection with safety
    if (onLocationSelect) {
      const clickHandler = (e: MouseEvent) => {
        try {
          const rect = mapDiv.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top
          
          // Convert click position to mock coordinates
          const lat = 12.9716 + (y / rect.height - 0.5) * 0.1
          const lng = 77.5946 + (x / rect.width - 0.5) * 0.1
          
          if (isFinite(lat) && isFinite(lng)) {
            onLocationSelect({ lat, lng })
            toast({ title: "Location Selected", description: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}` })
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to select location", variant: "destructive" })
        }
      }
      
      mapDiv.addEventListener('click', clickHandler)
      
      // Cleanup function
      return () => {
        mapDiv.removeEventListener('click', clickHandler)
        if (mapContainer && mapContainer.contains(mapDiv)) {
          mapContainer.removeChild(mapDiv)
        }
      }
    }

    return () => {
      if (mapContainer) {
        mapContainer.innerHTML = ''
      }
    }
  }, [fishermanLocation, buyerLocation, showRoute, onLocationSelect, height, toast])

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
          className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow border"
          title="Get Current Location"
        >
          <Navigation className="h-4 w-4" />
        </button>
      )}
      
      {showRoute && fishermanLocation && buyerLocation && (
        <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm p-3 rounded-lg border">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Live Tracking:</span>
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
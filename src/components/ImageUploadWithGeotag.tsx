import { useState, useRef } from "react"
import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, MapPin } from "lucide-react"

interface ImageUploadWithGeotagProps {
  onImageUploaded: (imageData: { url: string; latitude?: number; longitude?: number }) => void
  value?: string
}

const ImageUploadWithGeotag = ({ onImageUploaded, value }: ImageUploadWithGeotagProps) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(value || "")

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Create preview URL
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      // Get geolocation if available
      let latitude: number | undefined
      let longitude: number | undefined

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            })
          })
          latitude = position.coords.latitude
          longitude = position.coords.longitude
          
          toast({ 
            title: "Location captured", 
            description: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}` 
          })
        } catch (geoError) {
          console.log("Could not get location:", geoError)
        }
      }

      // For demo purposes, we'll use the preview URL
      // In a real app, you'd upload to a service like Supabase Storage
      onImageUploaded({
        url: preview,
        latitude,
        longitude
      })

    } catch (error) {
      toast({ title: "Error", description: "Failed to process image", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Fish Image</Label>
        <div className="mt-2 space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Processing..." : "Upload Image"}
            </Button>
            {navigator.geolocation && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                Geotag enabled
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {previewUrl && (
            <div className="mt-2">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-24 h-24 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageUploadWithGeotag
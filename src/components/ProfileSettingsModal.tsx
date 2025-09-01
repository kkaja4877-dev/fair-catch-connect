import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { MapPin, CreditCard, User } from "lucide-react"
import MapComponent from "./MapComponent"

interface ProfileSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onProfileUpdate?: () => void
}

const ProfileSettingsModal = ({ isOpen, onClose, onProfileUpdate }: ProfileSettingsModalProps) => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    upi_id: "",
    latitude: null as number | null,
    longitude: null as number | null
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        upi_id: (profile as any).upi_id || "",
        latitude: (profile as any).latitude || null,
        longitude: (profile as any).longitude || null
      })
    }
  }, [isOpen, profile])

  const handleSave = async () => {
    try {
      setIsSaving(true)

      if (!formData.full_name) {
        toast({ title: "Error", description: "Full name is required", variant: "destructive" })
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          upi_id: formData.upi_id,
          latitude: formData.latitude,
          longitude: formData.longitude
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast({ title: "Success", description: "Profile updated successfully!" })
      onProfileUpdate?.()
      onClose()
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }))
    setShowLocationPicker(false)
    toast({ title: "Success", description: "Location updated!" })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </DialogTitle>
          <DialogDescription>
            Update your profile information and delivery preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address Information</h3>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </h3>
            <div>
              <Label htmlFor="upi_id">UPI ID</Label>
              <Input
                id="upi_id"
                value={formData.upi_id}
                onChange={(e) => handleInputChange('upi_id', e.target.value)}
                placeholder="yourname@upi (e.g., john@paytm)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {profile?.role === 'fisherman' || profile?.role === 'supplier' 
                  ? "Your UPI ID for receiving payments"
                  : "Your UPI ID for making payments"
                }
              </p>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Settings
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowLocationPicker(!showLocationPicker)}
              >
                {formData.latitude && formData.longitude ? 'Update Location' : 'Set Location'}
              </Button>
            </div>
            
            {formData.latitude && formData.longitude && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Current Location:</strong> {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </p>
              </div>
            )}

            {showLocationPicker && (
              <div className="space-y-2">
                <Label>Click on the map to set your location</Label>
                <MapComponent
                  height="300px"
                  onLocationSelect={handleLocationSelect}
                  fishermanLocation={
                    formData.latitude && formData.longitude 
                      ? { lat: formData.latitude, lng: formData.longitude }
                      : null
                  }
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileSettingsModal
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import ImageUploadWithGeotag from "./ImageUploadWithGeotag"

interface EditListingModalProps {
  isOpen: boolean
  onClose: () => void
  listing: any
  fishTypes: any[]
  onSuccess: () => void
}

const EditListingModal = ({ isOpen, onClose, listing, fishTypes, onSuccess }: EditListingModalProps) => {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    fish_type_id: "",
    weight_kg: "",
    price_per_kg: "",
    description: "",
    location: "",
    catch_date: "",
    expires_at: "",
    image_url: ""
  })

  useEffect(() => {
    if (listing) {
      const expiresAt = listing.expires_at ? new Date(listing.expires_at).toISOString().slice(0, 16) : ""
      setFormData({
        title: listing.title || "",
        fish_type_id: listing.fish_type_id || "",
        weight_kg: listing.weight_kg?.toString() || "",
        price_per_kg: listing.price_per_kg?.toString() || "",
        description: listing.description || "",
        location: listing.location || "",
        catch_date: listing.catch_date || "",
        expires_at: expiresAt,
        image_url: listing.image_url || ""
      })
    }
  }, [listing])

  const handleUpdate = async () => {
    try {
      setIsUpdating(true)

      // Validate required fields
      if (!formData.title || !formData.fish_type_id || !formData.weight_kg || 
          !formData.price_per_kg || !formData.location || !formData.catch_date) {
        toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
        return
      }

      let expiresAt = new Date()
      if (formData.expires_at) {
        expiresAt = new Date(formData.expires_at)
        if (isNaN(expiresAt.getTime())) {
          toast({ title: "Error", description: "Invalid expiry date", variant: "destructive" })
          return
        }
      } else {
        expiresAt.setHours(expiresAt.getHours() + 24)
      }

      const updateData = {
        title: formData.title,
        fish_type_id: formData.fish_type_id,
        weight_kg: parseFloat(formData.weight_kg),
        price_per_kg: parseFloat(formData.price_per_kg),
        description: formData.description,
        location: formData.location,
        catch_date: formData.catch_date,
        expires_at: expiresAt.toISOString(),
        image_url: formData.image_url || null
      }

      const { error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', listing.id)

      if (error) throw error

      toast({ title: "Success", description: "Listing updated successfully!" })
      onSuccess()
      onClose()
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
          <DialogDescription>
            Update your fish listing details
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="fish_type">Fish Type</Label>
            <Select value={formData.fish_type_id} onValueChange={(value) => setFormData({...formData, fish_type_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select fish type" />
              </SelectTrigger>
              <SelectContent>
                {fishTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight_kg}
              onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="price">Price per kg (₹)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price_per_kg}
              onChange={(e) => setFormData({...formData, price_per_kg: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="catch_date">Catch Date</Label>
            <Input
              id="catch_date"
              type="date"
              value={formData.catch_date}
              onChange={(e) => setFormData({...formData, catch_date: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="expires_at">Expires At</Label>
            <Input
              id="expires_at"
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
            />
          </div>
          <div>
            <ImageUploadWithGeotag
              value={formData.image_url}
              onImageUploaded={(imageData) => setFormData({...formData, image_url: imageData.url})}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Listing"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditListingModal
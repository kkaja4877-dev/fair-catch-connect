import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { MapPin, Navigation, Clock, Package, CheckCircle } from "lucide-react"
import MapComponent from "./MapComponent"

interface DeliveryTrackingModalProps {
  isOpen: boolean
  onClose: () => void
  order: any
  onDeliveryComplete?: () => void
}

const DeliveryTrackingModal = ({ isOpen, onClose, order, onDeliveryComplete }: DeliveryTrackingModalProps) => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [deliveryOtp, setDeliveryOtp] = useState("")

  useEffect(() => {
    if (isOpen && order && profile?.role === 'fisherman') {
      generateAndStoreOtp()
    }
  }, [isOpen, order, profile])

  const generateAndStoreOtp = async () => {
    try {
      const { data } = await supabase.rpc('generate_delivery_otp')
      if (data) {
        setDeliveryOtp(data)
        await supabase
          .from('orders')
          .update({ 
            delivery_otp: data,
            delivery_status: 'in_transit'
          })
          .eq('id', order?.id)
        
        toast({ 
          title: "Delivery OTP Generated", 
          description: `Share this OTP with buyer: ${data}` 
        })
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleVerifyOtp = async () => {
    try {
      setIsVerifying(true)

      if (!otp) {
        toast({ title: "Error", description: "Please enter the OTP", variant: "destructive" })
        return
      }

      // Verify OTP
      const { data: orderData } = await supabase
        .from('orders')
        .select('delivery_otp')
        .eq('id', order?.id)
        .single()

      if (!orderData || orderData.delivery_otp !== otp) {
        toast({ title: "Error", description: "Invalid OTP", variant: "destructive" })
        return
      }

      // Mark order as delivered
      const { error } = await supabase
        .from('orders')
        .update({
          delivery_status: 'delivered',
          status: 'completed',
          delivery_completed_at: new Date().toISOString()
        })
        .eq('id', order?.id)

      if (error) throw error

      // Create notifications for different user types
      const notifications = []
      
      if (profile?.role === 'fisherman' || profile?.role === 'supplier') {
        notifications.push({
          title: "Earnings Updated",
          message: `Payment of ₹${order?.total_amount} has been processed`,
          type: "success"
        })
      } else if (profile?.role === 'hotel' || profile?.role === 'market') {
        notifications.push({
          title: "Stock Received",
          message: `Your order of ${order?.quantity_kg}kg has been delivered`,
          type: "success"
        })
      }

      toast({ title: "Success", description: "Order delivered successfully!" })
      onDeliveryComplete?.()
      onClose()
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleNavigate = () => {
    if (order?.buyer_latitude && order?.buyer_longitude) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${order.buyer_latitude},${order.buyer_longitude}`
      window.open(mapsUrl, '_blank')
    } else {
      toast({ title: "Info", description: "Buyer location not available for navigation", variant: "default" })
    }
  }

  if (!order) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Delivery Tracking - Order #{order.id?.slice(0, 8)}
          </DialogTitle>
          <DialogDescription>
            Track and manage order delivery with real-time location
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="space-y-4">
            <div className="h-80 bg-muted rounded-lg overflow-hidden">
              <MapComponent
                fishermanLocation={
                  order?.fisherman_latitude && order?.fisherman_longitude
                    ? { lat: Number(order.fisherman_latitude), lng: Number(order.fisherman_longitude) }
                    : null
                }
                buyerLocation={
                  order?.buyer_latitude && order?.buyer_longitude
                    ? { lat: Number(order.buyer_latitude), lng: Number(order.buyer_longitude) }
                    : null
                }
                showRoute={Boolean(order?.fisherman_latitude && order?.fisherman_longitude && order?.buyer_latitude && order?.buyer_longitude)}
              />
            </div>
            
            {profile?.role === 'fisherman' && order?.buyer_latitude && order?.buyer_longitude && (
              <Button onClick={handleNavigate} className="w-full">
                <Navigation className="h-4 w-4 mr-2" />
                Navigate to Buyer
              </Button>
            )}
            
            {profile?.role === 'fisherman' && (!order?.buyer_latitude || !order?.buyer_longitude) && (
              <Button disabled className="w-full">
                <Navigation className="h-4 w-4 mr-2" />
                Buyer Location Not Available
              </Button>
            )}
          </div>

          {/* Delivery Information */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-semibold">Delivery Details</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Order Amount</Label>
                  <p className="font-semibold">₹{order?.total_amount}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Quantity</Label>
                  <p className="font-semibold">{order?.quantity_kg}kg</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p className="font-semibold capitalize">{order?.delivery_status || 'pending'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment</Label>
                  <p className="font-semibold capitalize">{order?.payment_status}</p>
                </div>
              </div>
            </div>

            {/* OTP Section */}
            {profile?.role === 'fisherman' && deliveryOtp && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="font-semibold">Delivery OTP</span>
                </div>
                <p className="text-2xl font-bold text-primary">{deliveryOtp}</p>
                <p className="text-sm text-muted-foreground">Share this OTP with the buyer</p>
              </div>
            )}

            {/* OTP Verification for Buyer */}
            {(profile?.role === 'supplier' || profile?.role === 'hotel' || profile?.role === 'market') && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="otp">Enter Delivery OTP</Label>
                  <Input
                    id="otp"
                    placeholder="Enter 4-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get the OTP from the delivery person
                  </p>
                </div>
                
                <Button 
                  onClick={handleVerifyOtp} 
                  disabled={isVerifying || !otp}
                  className="w-full"
                >
                  {isVerifying ? "Verifying..." : "Confirm Delivery"}
                </Button>
              </div>
            )}

            {/* Delivery Timeline */}
            <div className="space-y-3">
              <Label className="font-semibold">Delivery Timeline</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${order?.payment_status === 'paid' ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Payment Confirmed</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${order?.delivery_status === 'in_transit' ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Out for Delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${order?.delivery_status === 'delivered' ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="text-sm">Delivered</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              {profile?.role !== 'fisherman' && order?.delivery_status !== 'delivered' && (
                <Button variant="outline" className="flex-1">
                  <Clock className="h-4 w-4 mr-2" />
                  Track Live
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeliveryTrackingModal
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/enhanced-button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, CreditCard, Truck, CheckCircle } from "lucide-react"

interface OrderCardProps {
  order: any
  onPayNow?: () => void
  onTrackOrder?: () => void
  userRole?: 'fisherman' | 'supplier' | 'hotel' | 'market' | 'business'
}

const OrderCard = ({ order, onPayNow, onTrackOrder, userRole }: OrderCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: 'default' as const, color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      paid: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      delivered: { variant: 'outline' as const, color: 'bg-green-50 text-green-700' },
      cancelled: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    }
    return statusMap[status as keyof typeof statusMap] || statusMap.pending
  }

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusMap = {
      pending: { label: 'Payment Pending', color: 'bg-orange-100 text-orange-800' },
      paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
      failed: { label: 'Payment Failed', color: 'bg-red-100 text-red-800' }
    }
    return statusMap[paymentStatus as keyof typeof statusMap] || statusMap.pending
  }

  const getDeliveryStatusBadge = (deliveryStatus: string) => {
    const statusMap = {
      pending: { label: 'Delivery Pending', color: 'bg-gray-100 text-gray-800' },
      'in-transit': { label: 'In Transit', color: 'bg-blue-100 text-blue-800' },
      delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' }
    }
    return statusMap[deliveryStatus as keyof typeof statusMap] || statusMap.pending
  }

  const statusBadge = getStatusBadge(order.status)
  const paymentBadge = getPaymentStatusBadge(order.payment_status)
  const deliveryBadge = getDeliveryStatusBadge(order.delivery_status || 'pending')

  return (
    <Card className="border rounded-lg">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold">{order.listings?.title || 'Order'}</h4>
          <Badge variant={statusBadge.variant} className={statusBadge.color}>
            {order.status}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">
          {order.listings?.fish_types?.name} • {order.quantity_kg}kg
          {userRole === 'fisherman' && order.profiles?.full_name && (
            <span> • Buyer: {order.profiles.full_name}</span>
          )}
          {(userRole === 'supplier' || userRole === 'hotel' || userRole === 'business') && 
           order.profiles?.full_name && (
            <span> • Seller: {order.profiles.full_name}</span>
          )}
        </p>
        
        <p className="text-lg font-bold text-primary mb-3">₹{order.total_amount}</p>
        
        <div className="flex gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className={paymentBadge.color}>
            {paymentBadge.label}
          </Badge>
          <Badge variant="outline" className={deliveryBadge.color}>
            {deliveryBadge.label}
          </Badge>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {order.payment_status === 'pending' && onPayNow && (
            <Button size="sm" onClick={onPayNow} className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              Pay Now
            </Button>
          )}
          
          {order.payment_status === 'paid' && 
           order.delivery_status !== 'delivered' && 
           onTrackOrder && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onTrackOrder}
              className="flex items-center gap-1"
            >
              <MapPin className="h-4 w-4" />
              Track Order
            </Button>
          )}
          
          {userRole === 'fisherman' && 
           order.payment_status === 'paid' && 
           order.delivery_status !== 'delivered' && (
            <Button 
              size="sm" 
              variant="outline"
              className="flex items-center gap-1"
            >
              <Truck className="h-4 w-4" />
              Deliver with OTP
            </Button>
          )}
          
          {order.delivery_status === 'delivered' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Delivered
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderCard
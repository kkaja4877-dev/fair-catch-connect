import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Fish, ShoppingCart, TrendingUp, DollarSign, Plus, Eye, Star, MessageCircle, Heart, Search, Building2, Settings, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import NotificationBell from "../NotificationBell"
import PaymentModal from "../PaymentModal"
import ChatModal from "../ChatModal"

const BusinessDashboard = () => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [listings, setListings] = useState([])
  const [myBids, setMyBids] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [priceHistory, setPriceHistory] = useState([])
  const [selectedListing, setSelectedListing] = useState(null)
  const [bidAmount, setBidAmount] = useState("")
  const [bulkOrderQuantity, setBulkOrderQuantity] = useState("")
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, order: null })
  const [chatModal, setChatModal] = useState({ isOpen: false, listing: null, otherParty: null })
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    await Promise.all([
      fetchAvailableListings(),
      fetchMyBids(),
      fetchMyOrders(),
      fetchPriceHistory()
    ])
  }

  const fetchAvailableListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select(`
        *,
        fish_types (name),
        profiles (full_name)
      `)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
    
    if (data) setListings(data)
  }

  const fetchMyBids = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profileData) return

    const { data } = await supabase
      .from('bids')
      .select(`
        *,
        listings (title, fish_types (name)),
        profiles!bids_bidder_id_fkey (full_name)
      `)
      .eq('bidder_id', profileData.id)
      .order('created_at', { ascending: false })
    
    if (data) setMyBids(data)
  }

  const fetchMyOrders = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profileData) return

    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        listings (title, fish_types (name)),
        profiles!orders_seller_id_fkey (full_name)
      `)
      .eq('buyer_id', profileData.id)
      .order('created_at', { ascending: false })
    
    if (data) setMyOrders(data)
  }

  const fetchPriceHistory = async () => {
    const { data } = await supabase
      .from('price_history')
      .select(`
        *,
        fish_types (name)
      `)
      .order('date', { ascending: false })
      .limit(10)
    
    if (data) setPriceHistory(data)
  }

  const handlePlaceBid = async () => {
    try {
      if (!bidAmount) {
        toast({ title: "Error", description: "Please enter bid amount", variant: "destructive" })
        return
      }

      if (parseFloat(bidAmount) <= 0) {
        toast({ title: "Error", description: "Bid amount must be greater than 0", variant: "destructive" })
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profileData) {
        toast({ title: "Error", description: "Profile not found", variant: "destructive" })
        return
      }

      const quantity = selectedListing.weight_kg
      const totalBidAmount = parseFloat(bidAmount) * quantity
      
      const { error } = await supabase.from('bids').insert([{
        listing_id: selectedListing.id,
        bidder_id: profileData.id,
        bid_amount: parseFloat(bidAmount),
        quantity_kg: quantity,
        total_bid: totalBidAmount
      }])

      if (error) throw error

      toast({ title: "Success", description: "Bulk bid placed successfully!" })
      setSelectedListing(null)
      setBidAmount("")
      fetchMyBids()
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleBulkOrder = async (listing) => {
    try {
      if (!bulkOrderQuantity) {
        toast({ title: "Error", description: "Please enter quantity", variant: "destructive" })
        return
      }

      const quantity = parseFloat(bulkOrderQuantity)
      
      if (quantity <= 0) {
        toast({ title: "Error", description: "Quantity must be greater than 0", variant: "destructive" })
        return
      }

      if (quantity > listing.weight_kg) {
        toast({ title: "Error", description: "Quantity cannot exceed available stock", variant: "destructive" })
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profileData) {
        toast({ title: "Error", description: "Profile not found", variant: "destructive" })
        return
      }

      const totalAmount = quantity * listing.price_per_kg

      const { data: order, error } = await supabase.from('orders').insert([{
        listing_id: listing.id,
        buyer_id: profileData.id,
        seller_id: listing.fisherman_id,
        quantity_kg: quantity,
        price_per_kg: listing.price_per_kg,
        total_amount: totalAmount,
        delivery_address: "Business warehouse"
      }]).select().single()

      if (error) throw error

      toast({ title: "Success", description: "Bulk order placed successfully!" })
      setBulkOrderQuantity("")
      fetchMyOrders()
      
      // Open payment modal
      setPaymentModal({ isOpen: true, order })
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleMarkInterested = async (listing) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!profileData) {
        toast({ title: "Error", description: "Profile not found", variant: "destructive" })
        return
      }

      const { error } = await supabase.from('interests').insert([{
        listing_id: listing.id,
        buyer_id: profileData.id,
        message: `Business interested in bulk purchase of ${listing.title}`
      }])

      if (error) throw error

      toast({ title: "Success", description: "Interest marked for bulk purchase!" })
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.fish_types?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalSpent = myOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)
  const activeBids = myBids.filter(bid => bid.status === 'pending').length

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <p className="text-muted-foreground">Bulk seafood procurement for your business</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for bulk orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <NotificationBell />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Bids</p>
                <p className="text-2xl font-bold">{activeBids}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bulk Orders</p>
                <p className="text-2xl font-bold">{myOrders.length}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Stock</p>
                <p className="text-2xl font-bold">{listings.length}</p>
              </div>
              <Fish className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Procurement</p>
                <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bulk Purchase Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bulk Purchase Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{listing.title}</h4>
                    <Badge variant="default">Bulk Available</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {listing.fish_types?.name} • {listing.weight_kg}kg total • by {listing.profiles?.full_name}
                  </p>
                  <p className="text-lg font-bold text-primary">₹{listing.price_per_kg}/kg</p>
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1">
                      <Input 
                        placeholder="Quantity (kg)"
                        value={bulkOrderQuantity}
                        onChange={(e) => setBulkOrderQuantity(e.target.value)}
                        type="number"
                        className="mb-2"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedListing(listing)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Bid Bulk
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkInterested(listing)}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      Interested
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setChatModal({ 
                        isOpen: true, 
                        listing, 
                        otherParty: listing.profiles 
                      })}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Negotiate
                    </Button>
                    <Button size="sm" onClick={() => handleBulkOrder(listing)}>
                      Order Bulk
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Orders & Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Business Procurement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {myOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{order.listings?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.listings?.fish_types?.name} • {order.quantity_kg}kg
                      </p>
                      <p className="text-lg font-bold text-primary">₹{order.total_amount}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                      {order.payment_status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => setPaymentModal({ isOpen: true, order })}
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {priceHistory.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-2">Price Trends</h4>
                  {priceHistory.slice(0, 3).map((price) => (
                    <div key={price.id} className="text-sm mb-1">
                      <span className="font-medium">{price.fish_types?.name}</span>
                      <span className="text-muted-foreground ml-2">
                        ₹{price.avg_price}/kg avg
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Bid Modal */}
      {selectedListing && (
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Bid - {selectedListing.title}</DialogTitle>
              <DialogDescription>
                Place a bulk bid for the entire stock ({selectedListing.weight_kg}kg)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bidAmount">Bid Amount (per kg)</Label>
                <Input
                  id="bidAmount"
                  placeholder="₹650"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Total: ₹{(parseFloat(bidAmount) * selectedListing.weight_kg || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePlaceBid} className="flex-1">
                  Place Bulk Bid
                </Button>
                <Button variant="outline" onClick={() => setSelectedListing(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, order: null })}
        order={paymentModal.order}
        onPaymentComplete={() => {
          fetchMyOrders()
          setPaymentModal({ isOpen: false, order: null })
        }}
      />

      {/* Chat Modal */}
      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={() => setChatModal({ isOpen: false, listing: null, otherParty: null })}
        listing={chatModal.listing}
        otherParty={chatModal.otherParty}
      />
    </div>
  )
}

export default BusinessDashboard
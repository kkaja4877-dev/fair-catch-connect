import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Fish, ShoppingCart, TrendingUp, DollarSign, Plus, Eye, Star, MessageCircle, Heart, Search, ChefHat, Settings, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import NotificationBell from "../NotificationBell"
import PaymentModal from "../PaymentModal"
import ChatModal from "../ChatModal"
import DeliveryTrackingModal from "../DeliveryTrackingModal"
import ProfileSettingsModal from "../ProfileSettingsModal"

const HotelDashboard = () => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [listings, setListings] = useState([])
  const [myBids, setMyBids] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [selectedListing, setSelectedListing] = useState(null)
  const [bidAmount, setBidAmount] = useState("")
  const [quantity, setQuantity] = useState("")
  const [orderQuantity, setOrderQuantity] = useState("")
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, order: null })
  const [chatModal, setChatModal] = useState({ isOpen: false, listing: null, otherParty: null })
  const [deliveryModal, setDeliveryModal] = useState({ isOpen: false, order: null })
  const [profileModal, setProfileModal] = useState(false)
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
      fetchWatchlist()
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

  const fetchWatchlist = async () => {
    // For demo purposes, using recent listings as watchlist
    const { data } = await supabase
      .from('listings')
      .select(`
        *,
        fish_types (name),
        profiles (full_name)
      `)
      .eq('status', 'available')
      .limit(3)
    
    if (data) setWatchlist(data)
  }

  const handlePlaceBid = async () => {
    try {
      if (!bidAmount || !quantity) {
        toast({ title: "Error", description: "Please enter bid amount and quantity", variant: "destructive" })
        return
      }

      if (parseFloat(bidAmount) <= 0 || parseFloat(quantity) <= 0) {
        toast({ title: "Error", description: "Bid amount and quantity must be greater than 0", variant: "destructive" })
        return
      }

      if (parseFloat(quantity) > selectedListing.weight_kg) {
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

      const totalBidAmount = parseFloat(bidAmount) * parseFloat(quantity)
      
      const { error } = await supabase.from('bids').insert([{
        listing_id: selectedListing.id,
        bidder_id: profileData.id,
        bid_amount: parseFloat(bidAmount),
        quantity_kg: parseFloat(quantity),
        total_bid: totalBidAmount
      }])

      if (error) throw error

      toast({ title: "Success", description: "Bid placed successfully!" })
      setSelectedListing(null)
      setBidAmount("")
      setQuantity("")
      fetchMyBids()
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleQuickOrder = async (listing) => {
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

      const quantity = parseFloat(orderQuantity) || listing.weight_kg
      
      if (quantity <= 0) {
        toast({ title: "Error", description: "Quantity must be greater than 0", variant: "destructive" })
        return
      }

      if (quantity > listing.weight_kg) {
        toast({ title: "Error", description: "Quantity cannot exceed available stock", variant: "destructive" })
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
        delivery_address: "Hotel kitchen delivery"
      }]).select().single()

      if (error) throw error

      toast({ title: "Success", description: "Order placed successfully!" })
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
        message: `Hotel interested in ${listing.title} for our menu`
      }])

      if (error) throw error

      toast({ title: "Success", description: "Interest marked! Fisherman has been notified." })
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
          <h1 className="text-3xl font-bold">Hotel Dashboard</h1>
          <p className="text-muted-foreground">Fresh seafood for your restaurant</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" onClick={() => setProfileModal(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
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
                <p className="text-sm text-muted-foreground">Orders</p>
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
                <p className="text-sm text-muted-foreground">Available Fish</p>
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
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fresh Catch */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Fresh Catch for Kitchen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{listing.title}</h4>
                    <Badge variant="default">Fresh</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {listing.fish_types?.name} • {listing.weight_kg}kg • by {listing.profiles?.full_name}
                  </p>
                  <p className="text-lg font-bold text-primary">₹{listing.price_per_kg}/kg</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => setSelectedListing(listing)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Bid
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
                      Chat
                    </Button>
                    <Button size="sm" onClick={() => handleQuickOrder(listing)}>
                      Quick Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Activity */}
        <Card>
          <CardHeader>
            <CardTitle>My Kitchen Orders</CardTitle>
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
                      {order.payment_status === 'paid' && order.delivery_status !== 'delivered' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setDeliveryModal({ isOpen: true, order })}
                        >
                          <MapPin className="h-4 w-4 mr-1" />
                          Track
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bid Modal */}
      {selectedListing && (
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedListing.title}</DialogTitle>
              <DialogDescription>
                Place a bid for your kitchen needs
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bidAmount">Bid Amount (per kg)</Label>
                  <Input
                    id="bidAmount"
                    placeholder="₹650"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity (kg)</Label>
                  <Input
                    id="quantity"
                    placeholder="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePlaceBid} className="flex-1">
                  Place Bid
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

      {/* Delivery Tracking Modal */}
      <DeliveryTrackingModal
        isOpen={deliveryModal.isOpen}
        onClose={() => setDeliveryModal({ isOpen: false, order: null })}
        order={deliveryModal.order}
        onDeliveryComplete={() => {
          fetchMyOrders()
        }}
      />

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={profileModal}
        onClose={() => setProfileModal(false)}
        onProfileUpdate={() => {
          // Refresh profile data if needed
        }}
      />
    </div>
  )
}

export default HotelDashboard
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { ShoppingCart, TrendingUp, DollarSign, Package, Eye, Search } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"

const SupplierDashboard = () => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [listings, setListings] = useState([])
  const [myBids, setMyBids] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [selectedListing, setSelectedListing] = useState(null)
  const [bidAmount, setBidAmount] = useState("")
  const [quantity, setQuantity] = useState("")
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
      fetchMyOrders()
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

  const handlePlaceBid = async () => {
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

      const { error } = await supabase.from('bids').insert([{
        listing_id: selectedListing.id,
        bidder_id: profileData.id,
        bid_amount: parseFloat(bidAmount),
        quantity_kg: parseFloat(quantity),
        total_bid: parseFloat(bidAmount) * parseFloat(quantity)
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

  const handleBuyNow = async (listing) => {
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

      const { error } = await supabase.from('orders').insert([{
        listing_id: listing.id,
        buyer_id: profileData.id,
        seller_id: listing.fisherman_id,
        quantity_kg: listing.weight_kg,
        price_per_kg: listing.price_per_kg,
        total_amount: listing.total_price,
        delivery_address: "To be provided"
      }])

      if (error) throw error

      // Update listing status
      await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', listing.id)

      toast({ title: "Success", description: "Order placed successfully!" })
      fetchAvailableListings()
      fetchMyOrders()
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
          <h1 className="text-3xl font-bold">Supplier Dashboard</h1>
          <p className="text-muted-foreground">Source fresh seafood for your business</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search seafood..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
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
                <p className="text-sm text-muted-foreground">My Orders</p>
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
                <p className="text-sm text-muted-foreground">Available Listings</p>
                <p className="text-2xl font-bold">{listings.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
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
        {/* Available Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Available Seafood</CardTitle>
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedListing(listing)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View & Bid
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{listing.title}</DialogTitle>
                          <DialogDescription>
                            Place a bid or buy directly
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
                            <Button variant="ocean" onClick={() => handleBuyNow(listing)} className="flex-1">
                              Buy Now
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="ocean" onClick={() => handleBuyNow(listing)}>
                      Buy Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Bids & Orders */}
        <Card>
          <CardHeader>
            <CardTitle>My Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {[...myBids, ...myOrders].slice(0, 5).map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        {'bid_amount' in item ? 'Bid Placed' : 'Order Created'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.listings?.title} • {item.listings?.fish_types?.name}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ₹{'bid_amount' in item ? item.total_bid : item.total_amount}
                      </p>
                    </div>
                    <Badge variant={item.status === 'pending' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SupplierDashboard
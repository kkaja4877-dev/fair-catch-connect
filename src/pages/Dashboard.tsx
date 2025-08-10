import { useState, useEffect } from "react"
import Navigation from "@/components/Navigation"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Plus, Fish, TrendingUp, Users, ShoppingCart, Calendar, MapPin, Weight, DollarSign, Clock, Eye, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const Dashboard = () => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [listings, setListings] = useState([])
  const [bids, setBids] = useState([])
  const [orders, setOrders] = useState([])
  const [fishTypes, setFishTypes] = useState([])
  const [isAddingListing, setIsAddingListing] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)
  const [bidAmount, setBidAmount] = useState("")
  const [quantity, setQuantity] = useState("")

  const [newListing, setNewListing] = useState({
    title: "",
    fish_type_id: "",
    weight_kg: "",
    price_per_kg: "",
    description: "",
    location: "",
    catch_date: "",
    expires_at: ""
  })

  useEffect(() => {
    if (user) {
      fetchFishTypes()
      fetchListings()
      fetchBids()
      fetchOrders()
    }
  }, [user])

  const fetchFishTypes = async () => {
    const { data } = await supabase.from('fish_types').select('*')
    if (data) setFishTypes(data)
  }

  const fetchListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select(`
        *,
        fish_types (name),
        profiles (full_name)
      `)
      .order('created_at', { ascending: false })
    
    if (data) setListings(data)
  }

  const fetchBids = async () => {
    const { data } = await supabase
      .from('bids')
      .select(`
        *,
        listings (title, fish_types (name)),
        profiles!bids_bidder_id_fkey (full_name)
      `)
      .order('created_at', { ascending: false })
    
    if (data) setBids(data)
  }

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        listings (title, fish_types (name)),
        profiles!orders_buyer_id_fkey (full_name),
        profiles!orders_seller_id_fkey (full_name)
      `)
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
  }

  const handleAddListing = async () => {
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

      const { error } = await supabase.from('listings').insert([{
        ...newListing,
        fisherman_id: profileData.id,
        weight_kg: parseFloat(newListing.weight_kg),
        price_per_kg: parseFloat(newListing.price_per_kg),
        total_price: parseFloat(newListing.weight_kg) * parseFloat(newListing.price_per_kg),
        expires_at: new Date(newListing.expires_at).toISOString()
      }])

      if (error) throw error

      toast({ title: "Success", description: "Listing added successfully!" })
      setIsAddingListing(false)
      setNewListing({
        title: "",
        fish_type_id: "",
        weight_kg: "",
        price_per_kg: "",
        description: "",
        location: "",
        catch_date: "",
        expires_at: ""
      })
      fetchListings()
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
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
      fetchBids()
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
      fetchListings()
      fetchOrders()
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please sign in to access your dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name}!</h1>
          <p className="text-muted-foreground">Manage your seafood trading activities</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Listings</p>
                  <p className="text-2xl font-bold">{listings.filter(l => l.status === 'available').length}</p>
                </div>
                <Fish className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bids</p>
                  <p className="text-2xl font-bold">{bids.length}</p>
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
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">₹{orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0).toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          {profile?.role === 'fisherman' && (
            <Button onClick={() => setIsAddingListing(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Catch
            </Button>
          )}
          <Button variant="outline">View Analytics</Button>
          <Button variant="outline">Export Data</Button>
        </div>

        {/* Main Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Listings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {listings.slice(0, 5).map((listing) => (
                  <div key={listing.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{listing.title}</h4>
                      <Badge variant={listing.status === 'available' ? 'default' : 'secondary'}>
                        {listing.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{listing.fish_types?.name} • {listing.weight_kg}kg</p>
                    <p className="text-lg font-bold text-primary">₹{listing.price_per_kg}/kg</p>
                    <div className="flex gap-2 mt-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedListing(listing)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
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
                      {profile?.role === 'fisherman' && (
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {[...bids, ...orders].slice(0, 5).map((item, index) => (
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
                      <Badge>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Listing Modal */}
        {isAddingListing && (
          <Dialog open={isAddingListing} onOpenChange={setIsAddingListing}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Catch</DialogTitle>
                <DialogDescription>
                  List your fresh catch for buyers to discover
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Fresh Catch Today"
                    value={newListing.title}
                    onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="fish_type">Fish Type</Label>
                  <Select value={newListing.fish_type_id} onValueChange={(value) => setNewListing({...newListing, fish_type_id: value})}>
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
                    placeholder="25"
                    value={newListing.weight_kg}
                    onChange={(e) => setNewListing({...newListing, weight_kg: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price per kg (₹)</Label>
                  <Input
                    id="price"
                    placeholder="650"
                    value={newListing.price_per_kg}
                    onChange={(e) => setNewListing({...newListing, price_per_kg: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Mumbai Coast"
                    value={newListing.location}
                    onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="catch_date">Catch Date</Label>
                  <Input
                    id="catch_date"
                    type="date"
                    value={newListing.catch_date}
                    onChange={(e) => setNewListing({...newListing, catch_date: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="expires_at">Listing Expires At</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={newListing.expires_at}
                    onChange={(e) => setNewListing({...newListing, expires_at: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Fresh catch from today morning..."
                    value={newListing.description}
                    onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddingListing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddListing}>
                  Add Listing
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

export default Dashboard
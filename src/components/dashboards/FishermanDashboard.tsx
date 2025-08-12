import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Plus, Fish, TrendingUp, DollarSign, Package, Eye, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"

const FishermanDashboard = () => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [listings, setListings] = useState([])
  const [bids, setBids] = useState([])
  const [orders, setOrders] = useState([])
  const [fishTypes, setFishTypes] = useState([])
  const [isAddingListing, setIsAddingListing] = useState(false)
  const [interests, setInterests] = useState([])

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
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    await Promise.all([
      fetchFishTypes(),
      fetchMyListings(),
      fetchMyBids(),
      fetchMyOrders(),
      fetchInterests()
    ])
  }

  const fetchFishTypes = async () => {
    const { data } = await supabase.from('fish_types').select('*')
    if (data) setFishTypes(data)
  }

  const fetchMyListings = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profileData) return

    const { data } = await supabase
      .from('listings')
      .select(`
        *,
        fish_types (name)
      `)
      .eq('fisherman_id', profileData.id)
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
      .eq('listings.fisherman_id', profileData.id)
      .order('created_at', { ascending: false })
    
    if (data) setBids(data)
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
        profiles!orders_buyer_id_fkey (full_name)
      `)
      .eq('seller_id', profileData.id)
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
  }

  const fetchInterests = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!profileData) return

    // Note: Interests table would be queried here if types were available
    setInterests([])
  }

  const handleAcceptBid = async (bid) => {
    try {
      // Update bid status
      await supabase.from('bids').update({ status: 'accepted' }).eq('id', bid.id)
      
      // Create order
      await supabase.from('orders').insert([{
        listing_id: bid.listing_id,
        buyer_id: bid.bidder_id,
        seller_id: profile.id,
        quantity_kg: bid.quantity_kg,
        price_per_kg: bid.bid_amount / bid.quantity_kg,
        total_amount: bid.total_bid,
        delivery_address: 'To be confirmed'
      }])

      // Note: Notifications would be created here

      toast({ title: "Success", description: "Bid accepted successfully!" })
      fetchMyBids()
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleRejectBid = async (bid) => {
    try {
      await supabase.from('bids').update({ status: 'rejected' }).eq('id', bid.id)
      
      // Note: Notifications would be created here

      toast({ title: "Success", description: "Bid rejected" })
      fetchMyBids()
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleAddListing = async () => {
    try {
      // Validate required fields
      if (!newListing.title || !newListing.fish_type_id || !newListing.weight_kg || 
          !newListing.price_per_kg || !newListing.location || !newListing.catch_date) {
        toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
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

      // Set default expires_at to 24 hours from now if not provided
      let expiresAt = new Date()
      if (newListing.expires_at) {
        expiresAt = new Date(newListing.expires_at)
        if (isNaN(expiresAt.getTime())) {
          toast({ title: "Error", description: "Invalid expiry date", variant: "destructive" })
          return
        }
      } else {
        expiresAt.setHours(expiresAt.getHours() + 24)
      }

      const { error } = await supabase.from('listings').insert([{
        ...newListing,
        fisherman_id: profileData.id,
        weight_kg: parseFloat(newListing.weight_kg),
        price_per_kg: parseFloat(newListing.price_per_kg),
        total_price: parseFloat(newListing.weight_kg) * parseFloat(newListing.price_per_kg),
        expires_at: expiresAt.toISOString()
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
      fetchMyListings()
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)
  const activeListings = listings.filter(l => l.status === 'available').length
  const totalBidsReceived = bids.length

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fisherman Dashboard</h1>
          <p className="text-muted-foreground">Manage your catches and sales</p>
        </div>
        <Button onClick={() => setIsAddingListing(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Catch
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">{activeListings}</p>
              </div>
              <Fish className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bids Received</p>
                <p className="text-2xl font-bold">{totalBidsReceived}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders Completed</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Listings */}
        <Card>
          <CardHeader>
            <CardTitle>My Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {listings.map((listing) => (
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
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bids */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {bids.map((bid) => (
                <div key={bid.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Bid from {bid.profiles?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {bid.listings?.title} • {bid.quantity_kg}kg
                      </p>
                      <p className="text-lg font-bold text-primary">₹{bid.total_bid}</p>
                    </div>
                    <Badge variant={bid.status === 'pending' ? 'default' : 'secondary'}>
                      {bid.status}
                    </Badge>
                  </div>
                  {bid.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="default" onClick={() => handleAcceptBid(bid)}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectBid(bid)}>Decline</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interested Buyers */}
        <Card>
          <CardHeader>
            <CardTitle>Interested Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {interests.map((interest) => (
                <div key={interest.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{interest.profiles?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Interested in: {interest.listings?.title}
                      </p>
                      {interest.message && (
                        <p className="text-sm mt-2 bg-muted p-2 rounded">{interest.message}</p>
                      )}
                    </div>
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Fresh catch description..."
                  value={newListing.description}
                  onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="expires_at">Expires At</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={newListing.expires_at}
                  onChange={(e) => setNewListing({...newListing, expires_at: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
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
  )
}

export default FishermanDashboard
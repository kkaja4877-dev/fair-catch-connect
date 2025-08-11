import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { ChefHat, ShoppingCart, TrendingUp, Calendar, Eye, Search, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"

const HotelDashboard = () => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [listings, setListings] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [selectedListing, setSelectedListing] = useState(null)
  const [orderQuantity, setOrderQuantity] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterByFreshness, setFilterByFreshness] = useState("")

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    await Promise.all([
      fetchAvailableListings(),
      fetchMyOrders(),
      fetchWatchlist()
    ])
  }

  const fetchAvailableListings = async () => {
    let query = supabase
      .from('listings')
      .select(`
        *,
        fish_types (name, category),
        profiles (full_name, rating)
      `)
      .eq('status', 'available')
      .order('created_at', { ascending: false })

    if (filterByFreshness === 'today') {
      const today = new Date().toISOString().split('T')[0]
      query = query.eq('catch_date', today)
    }
    
    const { data } = await query
    if (data) setListings(data)
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
      const { error } = await supabase.from('orders').insert([{
        listing_id: listing.id,
        buyer_id: profileData.id,
        seller_id: listing.fisherman_id,
        quantity_kg: quantity,
        price_per_kg: listing.price_per_kg,
        total_amount: quantity * listing.price_per_kg,
        delivery_address: "Restaurant Kitchen"
      }])

      if (error) throw error

      toast({ title: "Success", description: "Order placed for restaurant delivery!" })
      setSelectedListing(null)
      setOrderQuantity("")
      fetchMyOrders()
      fetchAvailableListings()
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.fish_types?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.fish_types?.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalSpent = myOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)
  const pendingOrders = myOrders.filter(order => order.status === 'pending').length
  const todaysDeliveries = myOrders.filter(order => {
    const today = new Date().toISOString().split('T')[0]
    return order.delivery_date === today
  }).length

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
          <p className="text-muted-foreground">Fresh seafood for your kitchen</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterByFreshness}
            onChange={(e) => setFilterByFreshness(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Catches</option>
            <option value="today">Today's Catch</option>
          </select>
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
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <ChefHat className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
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
                <p className="text-sm text-muted-foreground">Today's Deliveries</p>
                <p className="text-2xl font-bold">{todaysDeliveries}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Spend</p>
                <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Premium Selections */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Premium Seafood Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{listing.title}</h4>
                    <Badge variant="default">
                      {listing.fish_types?.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {listing.fish_types?.name} • {listing.weight_kg}kg
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Supplier: {listing.profiles?.full_name} ⭐ {listing.profiles?.rating}/5
                  </p>
                  <p className="text-lg font-bold text-primary">₹{listing.price_per_kg}/kg</p>
                  <div className="flex gap-2 mt-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedListing(listing)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Quick Order
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Quick Order - {listing.title}</DialogTitle>
                          <DialogDescription>
                            Order fresh seafood for your restaurant
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="orderQuantity">Quantity (kg)</Label>
                            <Input
                              id="orderQuantity"
                              placeholder={`Max: ${listing.weight_kg}kg`}
                              value={orderQuantity}
                              onChange={(e) => setOrderQuantity(e.target.value)}
                            />
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm">Order Summary:</p>
                            <p className="font-semibold">
                              {orderQuantity || listing.weight_kg}kg × ₹{listing.price_per_kg} = 
                              ₹{((parseFloat(orderQuantity) || listing.weight_kg) * listing.price_per_kg).toLocaleString()}
                            </p>
                          </div>
                          <Button onClick={() => handleQuickOrder(listing)} className="w-full">
                            Confirm Order
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="ocean">
                      Add to Watchlist
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Watchlist & Recent Orders */}
        <div className="space-y-6">
          {/* Watchlist */}
          <Card>
            <CardHeader>
              <CardTitle>Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {watchlist.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.fish_types?.name}</p>
                    <p className="text-sm font-bold text-primary">₹{item.price_per_kg}/kg</p>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-1" />
                  Add More
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {myOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{order.listings?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.quantity_kg}kg • ₹{order.total_amount}
                        </p>
                      </div>
                      <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HotelDashboard
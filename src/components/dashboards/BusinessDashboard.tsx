import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Building2, TrendingUp, Package, BarChart3, Eye, Search, Download } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"

const BusinessDashboard = () => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [listings, setListings] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [priceHistory, setPriceHistory] = useState([])
  const [selectedListing, setSelectedListing] = useState(null)
  const [bulkOrderQuantity, setBulkOrderQuantity] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    await Promise.all([
      fetchBulkListings(),
      fetchMyOrders(),
      fetchPriceHistory()
    ])
  }

  const fetchBulkListings = async () => {
    const { data } = await supabase
      .from('listings')
      .select(`
        *,
        fish_types (name, category),
        profiles (full_name, rating, is_verified)
      `)
      .eq('status', 'available')
      .gte('weight_kg', 50) // Show only bulk quantities
      .order('weight_kg', { ascending: false })
    
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

      const { error } = await supabase.from('orders').insert([{
        listing_id: listing.id,
        buyer_id: profileData.id,
        seller_id: listing.fisherman_id,
        quantity_kg: quantity,
        price_per_kg: listing.price_per_kg,
        total_amount: quantity * listing.price_per_kg,
        delivery_address: "Wholesale Distribution Center"
      }])

      if (error) throw error

      toast({ title: "Success", description: "Bulk order placed successfully!" })
      setSelectedListing(null)
      setBulkOrderQuantity("")
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
  const totalVolume = myOrders.reduce((sum, order) => sum + parseFloat(order.quantity_kg || 0), 0)
  const avgPrice = totalVolume > 0 ? totalSpent / totalVolume : 0

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <p className="text-muted-foreground">Wholesale seafood procurement & analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search bulk listings..."
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
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold">{totalVolume.toLocaleString()}kg</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
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
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Price/kg</p>
                <p className="text-2xl font-bold">₹{avgPrice.toFixed(0)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bulk Listings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bulk Seafood Listings (50kg+)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{listing.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant="default">{listing.fish_types?.category}</Badge>
                      {listing.profiles?.is_verified && (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {listing.fish_types?.name} • {listing.weight_kg}kg available
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Supplier: {listing.profiles?.full_name} ⭐ {listing.profiles?.rating}/5
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-primary">₹{listing.price_per_kg}/kg</p>
                    <p className="text-sm text-muted-foreground">
                      Total: ₹{(listing.weight_kg * listing.price_per_kg).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedListing(listing)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Bulk Order
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Bulk Order - {listing.title}</DialogTitle>
                          <DialogDescription>
                            Place a wholesale order
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="bulkQuantity">Quantity (kg)</Label>
                            <Input
                              id="bulkQuantity"
                              placeholder={`Max: ${listing.weight_kg}kg`}
                              value={bulkOrderQuantity}
                              onChange={(e) => setBulkOrderQuantity(e.target.value)}
                            />
                          </div>
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm">Bulk Order Summary:</p>
                            <p className="font-semibold">
                              {bulkOrderQuantity}kg × ₹{listing.price_per_kg} = 
                              ₹{(parseFloat(bulkOrderQuantity) * listing.price_per_kg).toLocaleString() || 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Delivery to wholesale distribution center
                            </p>
                          </div>
                          <Button onClick={() => handleBulkOrder(listing)} className="w-full">
                            Confirm Bulk Order
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="ocean">
                      Request Quote
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Analytics & Recent Orders */}
        <div className="space-y-6">
          {/* Price History */}
          <Card>
            <CardHeader>
              <CardTitle>Price Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {priceHistory.map((price) => (
                  <div key={price.id} className="border rounded-lg p-3">
                    <p className="font-semibold text-sm">{price.fish_types?.name}</p>
                    <div className="flex justify-between text-xs">
                      <span>Avg: ₹{price.avg_price}/kg</span>
                      <span>{new Date(price.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Range: ₹{price.min_price}-{price.max_price}</span>
                      <span>Vol: {price.total_volume_kg}kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bulk Orders</CardTitle>
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

export default BusinessDashboard
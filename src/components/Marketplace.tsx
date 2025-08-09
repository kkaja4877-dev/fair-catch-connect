import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Weight, DollarSign, TrendingUp } from "lucide-react"

const Marketplace = () => {
  const mockListings = [
    {
      id: 1,
      fisherman: "Captain Rodriguez",
      fishType: "Fresh Tuna",
      weight: "25 kg",
      price: "$8.50/kg",
      location: "Pacific Coast",
      timePosted: "2 hours ago",
      image: "🐟",
      status: "available",
      currentBid: "$8.75/kg"
    },
    {
      id: 2,
      fisherman: "Miguel Santos",
      fishType: "Red Snapper",
      weight: "18 kg",
      price: "$12.00/kg",
      location: "Gulf Waters",
      timePosted: "4 hours ago",
      image: "🐠",
      status: "bidding",
      currentBid: "$12.50/kg"
    },
    {
      id: 3,
      fisherman: "Elena Martinez",
      fishType: "Fresh Salmon",
      weight: "32 kg",
      price: "$15.00/kg",
      location: "Northern Bay",
      timePosted: "1 hour ago",
      image: "🍣",
      status: "available",
      currentBid: "$15.25/kg"
    }
  ]

  return (
    <section id="marketplace" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Live Marketplace</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse fresh catches from verified fishermen. Bid directly or buy at listed prices.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Button variant="outline" size="sm">All Fish</Button>
          <Button variant="outline" size="sm">Tuna</Button>
          <Button variant="outline" size="sm">Salmon</Button>
          <Button variant="outline" size="sm">Snapper</Button>
          <Button variant="outline" size="sm">Shrimp</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-card transition-all duration-300 border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{listing.image}</span>
                      {listing.fishType}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">by {listing.fisherman}</p>
                  </div>
                  <Badge 
                    variant={listing.status === 'available' ? 'default' : 'secondary'}
                    className={listing.status === 'available' ? 'bg-success text-success-foreground' : ''}
                  >
                    {listing.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Weight className="w-4 h-4" />
                      {listing.weight}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {listing.location}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {listing.timePosted}
                  </div>
                  
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Starting Price</span>
                      <span className="font-semibold flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {listing.price}
                      </span>
                    </div>
                    
                    {listing.status === 'bidding' && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Current Bid
                        </span>
                        <span className="font-semibold text-success">{listing.currentBid}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Place Bid
                    </Button>
                    <Button variant="ocean" size="sm" className="flex-1">
                      Buy Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Listings
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Marketplace
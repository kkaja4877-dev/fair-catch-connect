import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Fish, 
  TrendingUp, 
  Shield, 
  Users, 
  MapPin, 
  Bell,
  CreditCard,
  Star,
  Truck
} from "lucide-react"

const Features = () => {
  const features = [
    {
      icon: <Fish className="w-8 h-8" />,
      title: "Live Catch Listings",
      description: "Real-time updates on fresh catches with photos, weights, and availability status.",
      color: "text-primary"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Price Transparency",
      description: "Historical price data and market trends to ensure fair pricing for all parties.",
      color: "text-accent"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Trading",
      description: "Verified profiles, secure payments, and dispute resolution for peace of mind.",
      color: "text-success"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Direct Connection",
      description: "Connect fishermen directly with buyers, eliminating exploitative middlemen.",
      color: "text-primary"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Location Tracking",
      description: "GPS-verified catch locations and real-time boat tracking for authenticity.",
      color: "text-accent"
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Smart Notifications",
      description: "Instant alerts for new listings, bids, and price changes in your areas of interest.",
      color: "text-warning"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Secure Payments",
      description: "Integrated payment gateway with escrow services and automated receipts.",
      color: "text-success"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Rating System",
      description: "Build trust through transparent ratings and reviews from both sides.",
      color: "text-accent"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Logistics Support",
      description: "Coordinate delivery services and track shipments from boat to buyer.",
      color: "text-primary"
    }
  ]

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Complete Marketplace Solution
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to trade seafood directly and fairly. From catch to customer, 
            we provide the tools for transparent, efficient maritime commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-card transition-all duration-300 border-border">
              <CardHeader>
                <div className={`w-16 h-16 rounded-lg bg-gradient-seafoam flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="mt-20 bg-gradient-seafoam rounded-2xl p-8 lg:p-12">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">How It Works</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold mb-3">Fishermen List Catch</h4>
              <p className="text-muted-foreground">
                Upload photos, set prices, and provide details about your fresh catch including location and availability.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold mb-3">Buyers Browse & Bid</h4>
              <p className="text-muted-foreground">
                Search by fish type, location, or price. Place bids or buy directly at listed prices.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success text-success-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-3">Secure Transaction</h4>
              <p className="text-muted-foreground">
                Complete payment securely, coordinate delivery, and leave reviews to build trust.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
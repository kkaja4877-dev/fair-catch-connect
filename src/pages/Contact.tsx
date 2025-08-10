import Navigation from "@/components/Navigation"
import ContactUs from "@/components/ContactUs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

const Contact = () => {
  const locations = [
    {
      city: "Mumbai",
      address: "Sassoon Dock, Colaba",
      phone: "+91 98765 43210",
      email: "mumbai@seatrade.in",
      hours: "5:00 AM - 8:00 PM"
    },
    {
      city: "Kochi",
      address: "Marine Drive, Ernakulam",
      phone: "+91 98765 43211",
      email: "kochi@seatrade.in",
      hours: "5:30 AM - 7:30 PM"
    },
    {
      city: "Chennai",
      address: "Kasimedu Fishing Harbour",
      phone: "+91 98765 43212", 
      email: "chennai@seatrade.in",
      hours: "5:00 AM - 8:30 PM"
    },
    {
      city: "Mangalore",
      address: "Old Port, Bunder",
      phone: "+91 98765 43213",
      email: "mangalore@seatrade.in", 
      hours: "5:30 AM - 8:00 PM"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20">
        {/* Header */}
        <section className="py-16 bg-gradient-to-br from-ocean-50 to-ocean-100">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold mb-4 text-foreground">
              Get in Touch With Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Have questions? Need support? Want to partner with us? 
              We're here to help you succeed in the seafood trade.
            </p>
          </div>
        </section>

        {/* Our Locations */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Our Coastal Offices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {locations.map((location) => (
                <Card key={location.city} className="text-center border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      {location.city}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-primary" />
                      {location.phone}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-primary" />
                      {location.email}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {location.hours}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <ContactUs />

        {/* Emergency Support */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">24/7 Emergency Support</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center border-border">
                  <CardContent className="p-6">
                    <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Emergency Hotline</h3>
                    <p className="text-lg font-bold text-primary">1800-SEA-HELP</p>
                    <p className="text-sm text-muted-foreground">24/7 for urgent issues</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center border-border">
                  <CardContent className="p-6">
                    <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Technical Support</h3>
                    <p className="text-lg font-bold text-primary">tech@seatrade.in</p>
                    <p className="text-sm text-muted-foreground">Platform & app issues</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center border-border">
                  <CardContent className="p-6">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Field Support</h3>
                    <p className="text-lg font-bold text-primary">Mobile Teams</p>
                    <p className="text-sm text-muted-foreground">On-site assistance</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Contact
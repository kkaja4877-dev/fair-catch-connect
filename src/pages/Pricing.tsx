import Navigation from "@/components/Navigation"
import PricingTrends from "@/components/PricingTrends"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/enhanced-button"
import { CheckCircle } from "lucide-react"

const Pricing = () => {
  const plans = [
    {
      name: "Fisherman",
      price: "Free",
      description: "Perfect for individual fishermen to sell their catch",
      features: [
        "List unlimited catches",
        "Direct buyer communication",
        "Basic analytics",
        "Mobile app access",
        "Community support"
      ]
    },
    {
      name: "Supplier Pro",
      price: "₹999/month",
      description: "For suppliers and traders who buy in bulk",
      features: [
        "Bulk purchasing tools",
        "Advanced analytics",
        "Priority customer support",
        "Custom pricing alerts",
        "Inventory management",
        "Multi-location support"
      ]
    },
    {
      name: "Business",
      price: "₹2,499/month",
      description: "For hotels, restaurants, and large markets",
      features: [
        "Enterprise-grade features",
        "Dedicated account manager",
        "Custom integrations",
        "Volume discounts",
        "Advanced reporting",
        "24/7 priority support",
        "Custom contracts"
      ]
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
              Transparent Pricing for Everyone
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Choose the plan that fits your needs. From individual fishermen to large enterprises, 
              we have pricing that scales with your business.
            </p>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={plan.name} 
                  className={`relative overflow-hidden border-border ${
                    index === 1 ? 'border-primary shadow-lg scale-105' : ''
                  }`}
                >
                  {index === 1 && (
                    <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className={index === 1 ? 'pt-12' : ''}>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-primary">
                      {plan.price}
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      variant={index === 1 ? "ocean" : "outline"} 
                      className="w-full"
                    >
                      {plan.price === "Free" ? "Get Started" : "Start Free Trial"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Live Market Trends */}
        <PricingTrends />

        {/* FAQ Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is there a transaction fee?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We charge a small 2.5% transaction fee only when a sale is completed. 
                    No hidden fees, no monthly charges for basic users.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I upgrade or downgrade anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, you can change your plan at any time. Upgrades take effect immediately, 
                    and downgrades take effect at the end of your current billing cycle.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We accept all major credit cards, UPI, net banking, and digital wallets. 
                    All payments are processed securely through our payment partners.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Pricing
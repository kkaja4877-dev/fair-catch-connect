import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

const PricingTrends = () => {
  const priceData = [
    {
      fishType: "Pomfret",
      currentPrice: 1200,
      previousPrice: 1150,
      change: 4.3,
      volume: "2.5 tons",
      location: "Mumbai"
    },
    {
      fishType: "Kingfish",
      currentPrice: 850,
      previousPrice: 900,
      change: -5.6,
      volume: "1.8 tons",
      location: "Chennai"
    },
    {
      fishType: "Mackerel",
      currentPrice: 320,
      previousPrice: 310,
      change: 3.2,
      volume: "4.2 tons",
      location: "Kochi"
    },
    {
      fishType: "Prawns",
      currentPrice: 1500,
      previousPrice: 1480,
      change: 1.4,
      volume: "800 kg",
      location: "Mangalore"
    },
    {
      fishType: "Sardine",
      currentPrice: 180,
      previousPrice: 195,
      change: -7.7,
      volume: "3.5 tons",
      location: "Goa"
    },
    {
      fishType: "Tuna",
      currentPrice: 650,
      previousPrice: 620,
      change: 4.8,
      volume: "1.2 tons",
      location: "Visakhapatnam"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Live Market Prices</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time pricing trends across major coastal markets in India
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {priceData.map((item, index) => (
            <Card key={index} className="border-border hover:shadow-card transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.fishType}</CardTitle>
                  <div className={`flex items-center space-x-1 text-sm ${item.change > 0 ? 'text-success' : 'text-destructive'}`}>
                    {item.change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span>{Math.abs(item.change)}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{item.location}</p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Price</span>
                    <span className="text-xl font-bold text-primary">₹{item.currentPrice}/kg</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Previous</span>
                    <span className="text-muted-foreground">₹{item.previousPrice}/kg</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Volume Today</span>
                    <span className="font-medium">{item.volume}</span>
                  </div>
                  
                  <div className="mt-4 bg-muted rounded-lg p-2">
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${item.change > 0 ? 'bg-success' : 'bg-destructive'}`}
                        style={{ width: `${Math.min(Math.abs(item.change) * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Prices updated every 30 minutes • Last updated: {new Date().toLocaleTimeString('en-IN')}</p>
        </div>
      </div>
    </section>
  );
};

export default PricingTrends;
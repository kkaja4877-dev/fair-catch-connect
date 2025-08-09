import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/enhanced-button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, TrendingUp, Package, Users, DollarSign } from "lucide-react"

const Dashboard = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Dashboard Preview</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your listings, track sales, and monitor market trends from your personalized dashboard.
          </p>
        </div>

        <Tabs defaultValue="fisherman" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="fisherman">Fisherman Dashboard</TabsTrigger>
            <TabsTrigger value="buyer">Buyer Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="fisherman" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">12</div>
                  <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">$2,847</div>
                  <p className="text-xs text-muted-foreground">+15% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rating</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-muted-foreground">Based on 47 reviews</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Repeat Buyers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">23</div>
                  <p className="text-xs text-muted-foreground">+3 this month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Listings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Listings</CardTitle>
                <Button variant="ocean" size="sm">
                  <Plus className="w-4 h-4" />
                  Add New Catch
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { fish: "Fresh Tuna", weight: "25kg", price: "$8.50/kg", status: "active", bids: 3 },
                    { fish: "Red Snapper", weight: "18kg", price: "$12.00/kg", status: "sold", bids: 0 },
                    { fish: "Salmon", weight: "32kg", price: "$15.00/kg", status: "active", bids: 7 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div>
                        <h4 className="font-semibold">{item.fish}</h4>
                        <p className="text-sm text-muted-foreground">{item.weight} • {item.price}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                        {item.bids > 0 && (
                          <span className="text-sm text-primary font-medium">{item.bids} bids</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buyer" className="space-y-6">
            {/* Buyer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">8</div>
                  <p className="text-xs text-muted-foreground">3 leading bids</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">$5,234</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saved Suppliers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15</div>
                  <p className="text-xs text-muted-foreground">Trusted fishermen</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Savings</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">22%</div>
                  <p className="text-xs text-muted-foreground">vs market price</p>
                </CardContent>
              </Card>
            </div>

            {/* Watchlist */}
            <Card>
              <CardHeader>
                <CardTitle>Watchlist & Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { fish: "Premium Tuna", alert: "When below $9.00/kg", fisherman: "Captain Rodriguez" },
                    { fish: "Fresh Salmon", alert: "Any new listings", fisherman: "Elena Martinez" },
                    { fish: "Red Snapper", alert: "From trusted suppliers", fisherman: "Miguel Santos" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg">
                      <div>
                        <h4 className="font-semibold">{item.fish}</h4>
                        <p className="text-sm text-muted-foreground">{item.alert}</p>
                      </div>
                      <Badge variant="outline">{item.fisherman}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

export default Dashboard
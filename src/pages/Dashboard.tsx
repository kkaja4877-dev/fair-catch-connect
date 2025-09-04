import Navigation from "@/components/Navigation"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FishermanDashboard from "@/components/dashboards/FishermanDashboard"
import SupplierDashboard from "@/components/dashboards/SupplierDashboard"
import HotelDashboard from "@/components/dashboards/HotelDashboard"
import BusinessDashboard from "@/components/dashboards/BusinessDashboard"

const Dashboard = () => {
  const { user, profile } = useAuth()

  const renderDashboardByRole = () => {
    if (!profile?.role) {
      return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Dashboard Loading</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading your dashboard...</p>
          </CardContent>
        </Card>
      )
    }

    switch (profile.role) {
      case 'fisherman':
        return <FishermanDashboard />
      case 'supplier':
        return <SupplierDashboard />
      case 'hotel':
        return <HotelDashboard />
      case 'market':
        return <BusinessDashboard />
      default:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Dashboard Not Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No dashboard available for role: {profile.role}</p>
              <p>Please contact support for assistance.</p>
            </CardContent>
          </Card>
        )
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
          <p className="text-muted-foreground">Role: {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}</p>
        </div>

        {renderDashboardByRole()}
      </div>
    </div>
  )
}

export default Dashboard
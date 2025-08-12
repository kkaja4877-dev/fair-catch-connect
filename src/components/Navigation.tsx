import { Button } from "@/components/ui/enhanced-button"
import { Fish, Menu, X, User, LogOut, Bell } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Link } from "react-router-dom"

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fish className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">SeaTrade</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#marketplace" className="text-foreground hover:text-primary transition-colors">
              Marketplace
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
              How It Works
            </a>
            <Link to="/pricing" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
          
           <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="text-muted-foreground">
                    {profile?.full_name} ({profile?.role})
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="ocean">Get Started</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <a href="#marketplace" className="text-foreground hover:text-primary transition-colors">
                Marketplace
              </a>
              <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
                How It Works
              </a>
              <Link to="/pricing" className="text-foreground hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <div className="flex flex-col gap-2 mt-4">
                {user ? (
                  <>
                    <Link to="/dashboard">
                      <Button variant="outline" className="w-full">Dashboard</Button>
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {profile?.full_name} ({profile?.role})
                    </div>
                    <Button variant="outline" onClick={signOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="ghost">Sign In</Button>
                    </Link>
                    <Link to="/auth">
                      <Button variant="ocean">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation
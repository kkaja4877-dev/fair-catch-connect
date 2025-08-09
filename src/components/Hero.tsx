import { Button } from "@/components/ui/enhanced-button"
import { Fish, TrendingUp, Shield, Users } from "lucide-react"

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-ocean overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full animate-wave"></div>
        <div className="absolute bottom-40 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative container mx-auto px-6 py-20 lg:py-32">
        <div className="text-center text-white max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Direct Trade
            <span className="block bg-gradient-to-r from-primary-glow to-white bg-clip-text text-transparent">
              Fair Prices
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Connect fishermen directly with buyers. Eliminate middlemen, ensure fair pricing, 
            and build a transparent seafood marketplace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="fisherman" size="xl" className="text-lg">
              <Fish className="w-5 h-5" />
              Join as Fisherman
            </Button>
            <Button variant="buyer" size="xl" className="text-lg">
              <Users className="w-5 h-5" />
              Start Buying
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <TrendingUp className="w-12 h-12 mb-4 mx-auto text-primary-glow" />
              <h3 className="text-xl font-semibold mb-2">Fair Pricing</h3>
              <p className="text-white/80">Transparent market rates with real-time price tracking</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <Shield className="w-12 h-12 mb-4 mx-auto text-primary-glow" />
              <h3 className="text-xl font-semibold mb-2">Secure Trading</h3>
              <p className="text-white/80">Protected transactions with verified user profiles</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <Fish className="w-12 h-12 mb-4 mx-auto text-primary-glow" />
              <h3 className="text-xl font-semibold mb-2">Fresh Catch</h3>
              <p className="text-white/80">Live listings with catch time and location tracking</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
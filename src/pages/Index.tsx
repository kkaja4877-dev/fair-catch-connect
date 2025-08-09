import Navigation from "@/components/Navigation"
import Hero from "@/components/Hero"
import Marketplace from "@/components/Marketplace"
import Features from "@/components/Features"
import Dashboard from "@/components/Dashboard"

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Marketplace />
      <Features />
      <Dashboard />
    </div>
  );
};

export default Index;

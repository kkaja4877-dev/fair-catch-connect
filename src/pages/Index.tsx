import Navigation from "@/components/Navigation"
import Hero from "@/components/Hero"
import Marketplace from "@/components/Marketplace"
import Features from "@/components/Features"
import Dashboard from "@/components/Dashboard"
import PricingTrends from "@/components/PricingTrends"
import ContactUs from "@/components/ContactUs"

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Marketplace />
      <PricingTrends />
      <Features />
      <Dashboard />
      <ContactUs />
    </div>
  );
};

export default Index;

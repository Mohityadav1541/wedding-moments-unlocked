import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PhotographerSection from "@/components/landing/PhotographerSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
const Index = () => {
  return <div className="min-h-screen bg-background selection:bg-primary selection:text-white"><Header /><main><HeroSection /><FeaturesSection /><HowItWorksSection /><PhotographerSection /><TestimonialsSection /><CTASection /></main><Footer /></div>;
};
var stdin_default = Index;
export {
  stdin_default as default
};

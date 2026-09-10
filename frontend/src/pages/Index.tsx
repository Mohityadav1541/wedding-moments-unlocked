import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PhotographerSection from "@/components/landing/PhotographerSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";

import LazySection from "@/components/LazySection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />

        <LazySection id="features">
          <FeaturesSection />
        </LazySection>

        <LazySection id="how-it-works">
          <HowItWorksSection />
        </LazySection>

        <LazySection id="photographers">
          <PhotographerSection />
        </LazySection>

        <LazySection>
          <TestimonialsSection />
        </LazySection>

        <LazySection>
          <CTASection />
        </LazySection>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

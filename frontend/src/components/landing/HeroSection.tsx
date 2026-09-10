import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, QrCode } from "lucide-react";
import heroImage from "@/assets/hero-wedding.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-surface">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 transform translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8 animate-fade-up">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-body text-primary font-bold tracking-wide">AI-POWERED PHOTO DISCOVERY</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-[1.1] mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Your Memories, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
                Found Instantly.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="font-body text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              The smartest way to share and find photos.
              Upload a selfie and let our AI instantly deliver every photo you're in.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button size="xl" className="bg-primary hover:bg-primary-dark text-white rounded-xl px-8 h-14 text-lg shadow-lg shadow-primary/25 transition-all hover:scale-105">
                <Link to="/event/demo" className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Try Demo Event
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="border-2 border-accent text-accent hover:bg-accent hover:text-white rounded-xl px-8 h-14 text-lg transition-all hover:scale-105">
                <Link to="/auth?mode=signup" className="flex items-center gap-2">
                  For Photographers
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Trust Indicator */}
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                ))}
              </div>
              <p>Trusted by 500+ Studios</p>
            </div>
          </div>

          {/* Right Image/Visual */}
          <div className="lg:w-1/2 relative animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                src={heroImage}
                alt="App Preview"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Floating Elements */}
            <div className="absolute -bottom-10 -left-10 bg-white p-4 rounded-2xl shadow-xl z-20 animate-float hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">98% Accuracy</p>
                  <p className="text-xs text-gray-500">Face Recognition</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;

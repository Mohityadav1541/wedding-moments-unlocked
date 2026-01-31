import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Camera } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 md:py-32 bg-foreground relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-sage/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-background/10 rounded-full px-4 py-2 mb-6">
            <Camera className="h-4 w-4 text-primary fill-primary/50" />
            <span className="text-background/80 font-body text-sm">Join the wedding photography revolution</span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-6">
            Ready to Transform Your Wedding Photos?
          </h2>

          <p className="font-body text-lg text-background/70 mb-10 max-w-xl mx-auto">
            Whether you're a guest looking for your photos or a photographer ready to scale your business,
            we've got you covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-accent hover:bg-accent/90 text-black font-bold h-14 px-8 text-lg rounded-xl shadow-xl shadow-accent/20 transition-transform hover:scale-105" asChild>
              <Link to="/event/demo" className="gap-2">
                Try Demo Event
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-background/30 text-background hover:bg-background/10 hover:text-background"
              asChild
            >
              <Link to="/auth?mode=signup">
                Photographer Signup
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

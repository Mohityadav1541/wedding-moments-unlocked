import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Camera, ArrowRight } from "lucide-react";
import photographerImage from "@/assets/photographer-feature.jpg";
import { useQuery } from "@tanstack/react-query";
import { getLandingContent } from "@/lib/api";

const PhotographerSection = () => {
  const { data: content } = useQuery({
    queryKey: ['landing-content'],
    queryFn: getLandingContent
  });

  if (!content) {
    return (
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 h-96 bg-gray-200 rounded-2xl animate-pulse" />
            <div className="order-1 lg:order-2 space-y-6">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-6 w-full bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const { photographers } = content;

  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <img
              src={photographerImage}
              alt="Professional wedding photographer"
              className="w-full rounded-2xl shadow-elegant-md"
            />
            {/* Stats Card */}
            <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-xl shadow-elegant-md border border-border/50 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center">
                  <Camera className="h-6 w-6 text-sage-dark" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-foreground">200+</p>
                  <p className="font-body text-sm text-muted-foreground">Photographers</p>
                </div>
              </div>
            </div>
            {/* Decorative */}
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="inline-block text-primary font-body text-sm font-semibold tracking-wider uppercase mb-4">
              For Photographers
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {photographers.title}
            </h2>
            <p className="font-body text-lg text-muted-foreground mb-8">
              {photographers.description}
            </p>

            {/* Benefits List */}
            <ul className="space-y-4 mb-8">
              {photographers.benefits.map((benefit: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="font-body text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button variant="elegant" size="lg" asChild>
              <Link to="/auth?mode=signup" className="gap-2">
                Start Free Today
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhotographerSection;

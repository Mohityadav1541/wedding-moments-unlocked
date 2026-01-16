import { Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getLandingContent } from "@/lib/api";

const TestimonialsSection = () => {
  const { data: content } = useQuery({
    queryKey: ['landing-content'],
    queryFn: getLandingContent
  });

  if (!content) {
    return (
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded mx-auto animate-pulse" />
            <div className="h-10 w-3/4 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const { testimonials } = content;

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-primary font-body text-sm font-semibold tracking-wider uppercase mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Loved by Thousands
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            See what our happy couples and photographers have to say
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <div
              key={index}
              className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-card hover:shadow-elegant transition-all duration-300"
            >
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
              <p className="font-body text-foreground mb-6 italic leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-display font-semibold text-primary">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

import { useQuery } from "@tanstack/react-query";
import { getLandingContent } from "@/lib/api";
import { getIcon } from "@/lib/icons";

const FeaturesSection = () => {
  const { data: content } = useQuery({
    queryKey: ['landing-content'],
    queryFn: getLandingContent
  });

  if (!content) {
    return (
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded mx-auto animate-pulse" />
            <div className="h-10 w-3/4 bg-gray-200 rounded mx-auto animate-pulse" />
            <div className="h-6 w-1/2 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const { features = [] } = content || {};

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-primary font-body text-sm font-semibold tracking-wider uppercase mb-4">
            Features
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            A complete platform for wedding photography discovery and delivery
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features?.map((feature: any, index: number) => {
            const Icon = getIcon(feature.icon);
            return (
              <div
                key={index}
                className="group bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-card hover:shadow-elegant-md transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="font-body text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

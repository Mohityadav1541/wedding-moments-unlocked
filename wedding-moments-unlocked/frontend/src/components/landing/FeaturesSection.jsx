import { useQuery } from "@tanstack/react-query";
import { getLandingContent } from "@/lib/api";
import { getIcon } from "@/lib/icons";
import { Sparkles } from "lucide-react";
import { features as defaultFeatures } from "@/data/landingData";
const FeaturesSection = () => {
  const { data: content } = useQuery({
    queryKey: ["landing-content"],
    queryFn: getLandingContent,
    retry: 1
  });
  const rawFeatures = content?.features && content.features.length > 0 ? content.features : defaultFeatures;
  return <section className="py-20 md:py-32 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden" id="features">{
    /* Decorative Glow */
  }<div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" /><div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" /><div className="container mx-auto px-4 md:px-8 relative z-10">{
    /* Section Header */
  }<div className="text-center max-w-2xl mx-auto mb-16"><div className="badge-luxury mb-4"><Sparkles className="h-3.5 w-3.5" /> Platform Capabilities
          </div><h2 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-6">
            Enterprise AI Photo Intelligence
          </h2><p className="font-body text-lg text-muted-foreground leading-relaxed">
            Everything your photography studio needs to deliver seamless, instant photo discovery to thousands of guests.
          </p></div>{
    /* Features Grid */
  }<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">{rawFeatures.map((feature, index) => {
    const IconComponent = typeof feature.icon === "string" ? getIcon(feature.icon) : feature.icon;
    return <div
      key={index}
      className="group glass-card rounded-3xl p-8 border border-border/60 shadow-soft hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
    ><div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">{IconComponent ? <IconComponent className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}</div><h3 className="font-display text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{feature.title}</h3><p className="font-body text-muted-foreground leading-relaxed text-sm md:text-base">{feature.description}</p></div>;
  })}</div></div></section>;
};
var stdin_default = FeaturesSection;
export {
  stdin_default as default
};

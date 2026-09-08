import { Quote, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getLandingContent } from "@/lib/api";
import { testimonials as defaultTestimonials } from "@/data/landingData";
const TestimonialsSection = () => {
  const { data: content } = useQuery({
    queryKey: ["landing-content"],
    queryFn: getLandingContent,
    retry: 1
  });
  const testimonialList = content?.testimonials && content.testimonials.length > 0 ? content.testimonials : defaultTestimonials;
  return <section className="py-20 md:py-32 bg-background relative overflow-hidden"><div className="container mx-auto px-4 md:px-8">{
    /* Section Header */
  }<div className="text-center max-w-2xl mx-auto mb-16"><div className="badge-luxury mb-4"><Sparkles className="h-3.5 w-3.5" /> Client Reviews
          </div><h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
            Loved by Couples & Photographers
          </h2><p className="font-body text-lg text-muted-foreground">
            See what happy newlyweds and studio owners say about their experience.
          </p></div>{
    /* Testimonials Grid */
  }<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">{testimonialList.map((testimonial, index) => <div
    key={index}
    className="glass-card border border-border/60 rounded-3xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
  ><div><Quote className="h-10 w-10 text-primary/30 mb-4" /><p className="font-body text-foreground/90 mb-6 italic leading-relaxed text-sm md:text-base">
                  "{testimonial.content}"
                </p></div><div className="flex items-center gap-4 pt-4 border-t border-border/40"><div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-amber-500/20 rounded-2xl flex items-center justify-center font-display font-bold text-primary text-base shadow-sm">{testimonial.avatar}</div><div><p className="font-display font-bold text-foreground">{testimonial.name}</p><p className="font-body text-xs text-muted-foreground">{testimonial.role}</p></div></div></div>)}</div></div></section>;
};
var stdin_default = TestimonialsSection;
export {
  stdin_default as default
};

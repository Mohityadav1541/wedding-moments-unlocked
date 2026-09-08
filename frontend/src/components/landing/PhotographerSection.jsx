import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Camera, ArrowRight, Sparkles } from "lucide-react";
import photographerImage from "@/assets/photographer-feature.jpg";
import { useQuery } from "@tanstack/react-query";
import { getLandingContent } from "@/lib/api";
const defaultPhotographerData = {
  title: "Empower Your Photography Business",
  description: "Transform how you deliver photos to clients and guests. Increase referrals and streamline event photo distribution with custom studio branding.",
  benefits: [
    "Instant AI face recognition & photo matching for all guests",
    "Custom logo & watermark integration on all photos",
    "QR code instant access generation for venues & table cards",
    "Automated photo limits, analytics, and revenue stats",
    "Zero app downloads needed for guests on iOS & Android"
  ]
};
const PhotographerSection = () => {
  const { data: content } = useQuery({
    queryKey: ["landing-content"],
    queryFn: getLandingContent,
    retry: 1
  });
  const photographers = content?.photographers || defaultPhotographerData;
  return <section className="py-20 md:py-32 bg-muted/30 relative overflow-hidden" id="photographers"><div className="container mx-auto px-4 md:px-8"><div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">{
    /* Image */
  }<div className="relative order-2 lg:order-1"><div className="glow-border rounded-3xl overflow-hidden shadow-2xl bg-card border border-border/60"><img
    src={photographerImage}
    alt="Professional wedding photographer"
    className="w-full h-[400px] md:h-[480px] object-cover"
  /></div>{
    /* Stats Card */
  }<div className="absolute -bottom-6 -right-6 glass-card p-6 rounded-2xl shadow-xl border border-border/60 hidden md:flex items-center gap-4"><div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Camera className="h-6 w-6" /></div><div><p className="font-display text-2xl font-bold text-foreground">500+</p><p className="font-body text-xs text-muted-foreground">Partner Studios</p></div></div></div>{
    /* Content */
  }<div className="order-1 lg:order-2"><div className="badge-luxury mb-4"><Sparkles className="h-3.5 w-3.5" /> Built For Studios
            </div><h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">{photographers.title}</h2><p className="font-body text-lg text-muted-foreground mb-8 leading-relaxed">{photographers.description}</p>{
    /* Benefits List */
  }<ul className="space-y-4 mb-8">{photographers.benefits?.map((benefit, index) => <li key={index} className="flex items-start gap-3"><div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-primary"><Check className="h-3.5 w-3.5" /></div><span className="font-body text-foreground/90 text-sm md:text-base">{benefit}</span></li>)}</ul><Button size="xl" className="bg-primary hover:bg-primary-dark text-white rounded-2xl px-8 h-14 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" asChild><Link to="/auth?mode=signup" className="gap-2">
                Start Free Studio Account
                <ArrowRight className="h-5 w-5" /></Link></Button></div></div></div></section>;
};
var stdin_default = PhotographerSection;
export {
  stdin_default as default
};

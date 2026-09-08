import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, QrCode, ShieldCheck, Zap, CheckCircle2, Heart } from "lucide-react";
import heroImage from "@/assets/hero-wedding.jpg";
const HeroSection = () => {
  return <section className="relative min-h-[92vh] flex items-center pt-28 pb-16 overflow-hidden bg-gradient-hero">{
    /* Radiant Background Flares & Ambient Light */
  }<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" /><div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-[120px] pointer-events-none" /><div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-rose-200/20 rounded-full blur-[100px] pointer-events-none" /><div className="container mx-auto px-4 md:px-8 relative z-10"><div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">{
    /* Left Content Column */
  }<div className="lg:w-7/12 text-center lg:text-left">{
    /* Luxury Badge */
  }<div className="inline-flex items-center gap-2.5 bg-card/90 backdrop-blur-md border border-primary/20 rounded-full px-4 py-2 mb-6 shadow-sm animate-fade-up"><span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" /><Sparkles className="h-4 w-4 text-primary" /><span className="text-xs md:text-sm font-body font-bold text-foreground/90 tracking-wide uppercase">
                AI-Powered Event Photo Intelligence
              </span></div>{
    /* Main Headline */
  }<h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.08] mb-6 tracking-tight animate-fade-up">
              Every Wedding Memory, <br className="hidden sm:inline" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-rose-500 to-amber-600">
                Found in Milliseconds.
              </span></h1>{
    /* Subheadline */
  }<p className="font-body text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-up">
              Say goodbye to searching through 5,000+ unorganized event photos. Upload a single selfie, and our high-precision AI instantly compiles your personal wedding gallery.
            </p>{
    /* Feature Highlights Grid */
  }<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 text-left max-w-xl mx-auto lg:mx-0 animate-fade-up"><div className="flex items-center gap-2 text-xs md:text-sm font-body font-medium text-foreground/80"><CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span>Zero App Install Required</span></div><div className="flex items-center gap-2 text-xs md:text-sm font-body font-medium text-foreground/80"><CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span>99.4% Face Accuracy</span></div><div className="flex items-center gap-2 text-xs md:text-sm font-body font-medium text-foreground/80"><CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" /><span>1-Click ZIP Download</span></div></div>{
    /* Action Buttons */
  }<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up"><Button size="xl" className="bg-primary hover:bg-primary-dark text-white rounded-2xl px-8 h-14 text-base font-semibold shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] gap-2" asChild><Link to="/event/demo"><QrCode className="h-5 w-5" />
                  Try Live Event Demo
                </Link></Button><Button variant="outline" size="xl" className="border-2 border-border hover:border-primary/40 bg-card/60 backdrop-blur-md text-foreground hover:bg-card rounded-2xl px-8 h-14 text-base font-semibold transition-all hover:scale-[1.02] gap-2" asChild><Link to="/auth?mode=signup">
                  For Photographers & Studios
                  <ArrowRight className="h-5 w-5" /></Link></Button></div>{
    /* Photographer Trust Stats */
  }<div className="mt-10 pt-8 border-t border-border/40 flex items-center justify-center lg:justify-start gap-6 animate-fade-up"><div className="flex items-center gap-3"><div className="flex -space-x-2"><div className="w-9 h-9 rounded-full bg-amber-500/20 border-2 border-white flex items-center justify-center text-xs font-bold text-amber-700">RS</div><div className="w-9 h-9 rounded-full bg-rose-500/20 border-2 border-white flex items-center justify-center text-xs font-bold text-rose-700">AK</div><div className="w-9 h-9 rounded-full bg-indigo-500/20 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700">MK</div></div><div><p className="font-display font-bold text-sm text-foreground">500+ Top Photography Studios</p><p className="font-body text-xs text-muted-foreground">Delivering over 1 Million+ guest photos monthly</p></div></div></div></div>{
    /* Right Visual Card Column */
  }<div className="lg:w-5/12 relative w-full max-w-lg lg:max-w-none animate-fade-up"><div className="relative z-10 glow-border rounded-3xl overflow-hidden shadow-2xl bg-card border border-border/60"><img
    src={heroImage}
    alt="AI Wedding Moments App Preview"
    className="w-full h-[420px] sm:h-[480px] object-cover"
  /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-8 text-white"><div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium w-fit mb-2"><Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" /> Rahul & Madhu Wedding
                </div><h3 className="font-display text-2xl font-bold text-white mb-1">
                  1,240 Photos Indexed
                </h3><p className="font-body text-sm text-white/80">
                  Scan QR code or upload selfie to find all your candid moments.
                </p></div></div>{
    /* Floating Glassmorphic Badges */
  }<div className="absolute -top-6 -left-6 bg-card/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-border/60 z-20 hidden sm:flex items-center gap-3 animate-float"><div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600"><Zap className="h-6 w-6" /></div><div><p className="font-display font-bold text-sm text-foreground">Sub-Second Search</p><p className="font-body text-xs text-muted-foreground">Vector-indexed AI Search</p></div></div><div className="absolute -bottom-6 -right-6 bg-card/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-border/60 z-20 hidden sm:flex items-center gap-3 animate-float" style={{ animationDelay: "2s" }}><div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><ShieldCheck className="h-6 w-6" /></div><div><p className="font-display font-bold text-sm text-foreground">Private & Watermarked</p><p className="font-body text-xs text-muted-foreground">Custom Studio Branding</p></div></div></div></div></div></section>;
};
var stdin_default = HeroSection;
export {
  stdin_default as default
};

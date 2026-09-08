import { Phone, MessageCircle, ScanLine } from "lucide-react";
const ContactSection = () => {
  const whatsappLink = "https://wa.me/qr/OI6DXRUV72ENI1";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(whatsappLink)}`;
  return <section id="contact" className="py-20 bg-background"><div className="container mx-auto px-4"><div className="text-center max-w-2xl mx-auto mb-16"><span className="inline-block text-primary font-body text-sm font-semibold tracking-wider uppercase mb-4">
                        Get in Touch
                    </span><h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                        Contact Us
                    </h2><p className="font-body text-lg text-muted-foreground">
                        Have questions? Scan to chat or give us a call!
                    </p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">{
    /* Phone */
  }<div className="bg-card rounded-2xl p-8 border border-border/50 shadow-card text-center hover:shadow-elegant transition-all flex flex-col items-center justify-center"><div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6"><Phone className="h-8 w-8 text-primary" /></div><h3 className="font-display text-2xl font-bold text-foreground mb-4">Call Us</h3><p className="text-muted-foreground font-body text-lg space-y-2"><a href="tel:+916367139566" className="block hover:text-primary transition-colors">+91 63671 39566</a><a href="tel:+917990422256" className="block hover:text-primary transition-colors">+91 79904 22256</a></p></div>{
    /* WhatsApp QR */
  }<div className="bg-card rounded-2xl p-8 border border-border/50 shadow-card text-center hover:shadow-elegant transition-all flex flex-col items-center"><div className="mb-6 relative group"><div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" /><img
    src={qrCodeUrl}
    alt="WhatsApp QR Code"
    className="w-40 h-40 rounded-lg border-2 border-primary/20 p-2 bg-white relative z-10"
  /></div><h3 className="font-display text-xl font-bold text-foreground mb-2 flex items-center gap-2 justify-center"><MessageCircle className="h-5 w-5 text-green-600" />
                            WhatsApp Chat
                        </h3><a
    href={whatsappLink}
    target="_blank"
    rel="noreferrer"
    className="text-primary hover:underline font-body font-medium flex items-center gap-2 mt-2"
  ><ScanLine className="h-4 w-4" />
                            Click or Scan to Chat
                        </a></div></div></div></section>;
};
var stdin_default = ContactSection;
export {
  stdin_default as default
};

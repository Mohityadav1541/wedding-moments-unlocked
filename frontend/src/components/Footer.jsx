import { Link } from "react-router-dom";
import { Camera, Phone, MapPin, Instagram, MessageCircle, Twitter } from "lucide-react";
const Footer = () => {
  return <footer className="bg-primary text-white py-16"><div className="container mx-auto px-4"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">{
    /* Brand */
  }<div className="space-y-4"><div className="flex items-center gap-2"><Camera className="h-8 w-8 text-primary fill-primary/30" /><div className="flex flex-col"><span className="font-display text-xl font-semibold leading-tight">
                  Wedding AI
                </span><span className="text-xs text-background/60 font-body tracking-wider">
                  Photo Finder
                </span></div></div><p className="text-background/70 font-body text-sm leading-relaxed">
              AI-powered wedding photo discovery. Find your perfect moments instantly with face recognition technology.
            </p><div className="flex gap-4"><a href="https://www.instagram.com/yadav__mohit_0?igsh=MWZwcWUxYXBpdjlsNA==" target="_blank" rel="noreferrer" className="text-background/60 hover:text-primary transition-colors"><Instagram className="h-5 w-5" /></a><a href="https://wa.me/916367139566" target="_blank" rel="noreferrer" className="text-background/60 hover:text-primary transition-colors"><MessageCircle className="h-5 w-5" /></a><a href="#" className="text-background/60 hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a></div></div>{
    /* Quick Links */
  }<div><h4 className="font-display text-lg font-semibold mb-4">Quick Links</h4><ul className="space-y-3 font-body text-sm"><li><Link to="/#features" className="text-background/70 hover:text-primary transition-colors">
                  Features
                </Link></li><li><Link to="/#how-it-works" className="text-background/70 hover:text-primary transition-colors">
                  How It Works
                </Link></li><li><Link to="/auth" className="text-background/70 hover:text-primary transition-colors">
                  Photographer Login
                </Link></li><li><Link to="/event/demo" className="text-background/70 hover:text-primary transition-colors">
                  Try Demo
                </Link></li></ul></div>{
    /* For Photographers */
  }<div><h4 className="font-display text-lg font-semibold mb-4">For Photographers</h4><ul className="space-y-3 font-body text-sm"><li><Link to="/auth?mode=signup" className="text-background/70 hover:text-primary transition-colors">
                  Join as Photographer
                </Link></li><li><a href="#" className="text-background/70 hover:text-primary transition-colors">
                  Pricing Plans
                </a></li><li><a href="#" className="text-background/70 hover:text-primary transition-colors">
                  Help Center
                </a></li><li><a href="#" className="text-background/70 hover:text-primary transition-colors">
                  API Documentation
                </a></li></ul></div>{
    /* Contact */
  }<div><h4 className="font-display text-lg font-semibold mb-4">Contact Us</h4><ul className="space-y-3 font-body text-sm"><li className="flex items-center gap-2 text-background/70"><Phone className="h-4 w-4 text-primary" />
                +91 63671 39566, +91 79904 22256
              </li><li className="flex items-start gap-2 text-background/70"><MapPin className="h-4 w-4 text-primary mt-0.5" /><span><a href="https://wa.me/916367139566" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                    Chat on WhatsApp
                  </a></span></li></ul></div></div><div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"><p className="text-white/60 text-sm font-body">
            Made by @Mohit Yadav & @Garv
          </p><div className="flex gap-6 text-sm font-body"><a href="#" className="text-background/50 hover:text-primary transition-colors">
              Privacy Policy
            </a><a href="#" className="text-background/50 hover:text-primary transition-colors">
              Terms of Service
            </a></div></div></div></footer>;
};
var stdin_default = Footer;
export {
  stdin_default as default
};

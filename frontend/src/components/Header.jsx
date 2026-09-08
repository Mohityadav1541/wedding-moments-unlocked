import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { Menu, X, Sparkles, User, QrCode } from "lucide-react";
import { useState, useEffect } from "react";
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass-header shadow-soft py-3" : "bg-transparent py-5"}`}><div className="container mx-auto px-4 md:px-8"><div className="flex items-center justify-between"><Logo />{
    /* Desktop Navigation */
  }<nav className="hidden md:flex items-center gap-8 bg-card/60 backdrop-blur-md px-6 py-2 rounded-full border border-border/40 shadow-sm"><Link to="/#features" className="text-sm font-body font-medium text-foreground/80 hover:text-primary transition-colors">
              Features
            </Link><Link to="/#how-it-works" className="text-sm font-body font-medium text-foreground/80 hover:text-primary transition-colors">
              How It Works
            </Link><Link to="/#photographers" className="text-sm font-body font-medium text-foreground/80 hover:text-primary transition-colors">
              For Studios
            </Link><Link to="/event/demo" className="text-sm font-body font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Live Demo
            </Link></nav>{
    /* Desktop Actions */
  }<div className="hidden md:flex items-center gap-3"><Button variant="ghost" className="font-body text-sm font-medium hover:bg-primary/10 text-foreground" asChild><Link to="/auth" className="flex items-center gap-1.5"><User className="h-4 w-4" /> Sign In
              </Link></Button><Button size="default" className="bg-primary hover:bg-primary-dark text-white font-body text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" asChild><Link to="/auth?mode=signup" className="flex items-center gap-2"><QrCode className="h-4 w-4" /> Get Started Free
              </Link></Button></div>{
    /* Mobile Menu Button */
  }<button
    className="md:hidden p-2 text-primary"
    onClick={() => setIsMenuOpen(!isMenuOpen)}
  >{isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button></div>{
    /* Mobile Menu */
  }{isMenuOpen && <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in bg-white"><nav className="flex flex-col gap-4"><Link
    to="/#features"
    className="text-gray-600 hover:text-primary transition-colors font-body py-2 font-medium"
    onClick={() => setIsMenuOpen(false)}
  >
                Features
              </Link><Link
    to="/#how-it-works"
    className="text-gray-600 hover:text-primary transition-colors font-body py-2 font-medium"
    onClick={() => setIsMenuOpen(false)}
  >
                How It Works
              </Link><Link
    to="/#photographers"
    className="text-gray-600 hover:text-primary transition-colors font-body py-2 font-medium"
    onClick={() => setIsMenuOpen(false)}
  >
                For Photographers
              </Link><div className="flex flex-col gap-2 pt-4 border-t border-gray-100"><Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5" asChild><Link to="/auth">Sign In</Link></Button><Button className="w-full bg-accent text-black font-bold hover:bg-accent/90" asChild><Link to="/auth?mode=signup">Get Started</Link></Button></div></nav></div>}</div></header>;
};
var stdin_default = Header;
export {
  stdin_default as default
};

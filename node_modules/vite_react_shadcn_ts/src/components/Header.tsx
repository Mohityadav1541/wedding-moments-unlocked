import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/#features" className="text-gray-600 hover:text-primary transition-colors font-body font-medium">
              Features
            </Link>
            <Link to="/#how-it-works" className="text-gray-600 hover:text-primary transition-colors font-body font-medium">
              How It Works
            </Link>
            <Link to="/#photographers" className="text-gray-600 hover:text-primary transition-colors font-body font-medium">
              For Photographers
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-primary hover:bg-primary/5 hover:text-primary-dark font-medium" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-black font-semibold rounded-lg shadow-lg shadow-accent/20" asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in bg-white">
            <nav className="flex flex-col gap-4">
              <Link
                to="/#features"
                className="text-gray-600 hover:text-primary transition-colors font-body py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/#how-it-works"
                className="text-gray-600 hover:text-primary transition-colors font-body py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                to="/#photographers"
                className="text-gray-600 hover:text-primary transition-colors font-body py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                For Photographers
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button className="w-full bg-accent text-black font-bold hover:bg-accent/90" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

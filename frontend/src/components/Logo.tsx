import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      <div className="relative">
        <Heart className="h-8 w-8 text-primary fill-primary/20 group-hover:fill-primary/40 transition-all duration-300" />
        <div className="absolute inset-0 animate-pulse opacity-50">
          <Heart className="h-8 w-8 text-primary/50" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-xl font-semibold text-foreground leading-tight">
          Wedding AI
        </span>
        <span className="text-xs text-muted-foreground font-body tracking-wider">
          Photo Finder
        </span>
      </div>
    </Link>
  );
};

export default Logo;

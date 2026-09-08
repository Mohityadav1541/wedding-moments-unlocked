import { Link } from "react-router-dom";
const Logo = ({ className = "" }) => {
  return <Link to="/" className={`flex items-center gap-2 group ${className}`}><div className="relative h-10 w-10"><img
    src="/camera-logo.svg"
    alt="Wedding AI Logo"
    className="h-full w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
  /></div><div className="flex flex-col"><span className="font-display text-xl font-semibold text-foreground leading-tight">
          Wedding AI
        </span><span className="text-xs text-muted-foreground font-body tracking-wider">
          Photo Finder
        </span></div></Link>;
};
var stdin_default = Logo;
export {
  stdin_default as default
};

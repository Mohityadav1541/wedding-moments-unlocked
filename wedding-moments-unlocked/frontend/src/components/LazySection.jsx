import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";
const LazySection = ({ id, children, className, threshold = 0.1 }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold,
    rootMargin: "200px 0px"
    // Pre-load 200px before appearing
  });
  return <div
    ref={ref}
    id={id}
    className={cn("min-h-[50vh] transition-opacity duration-700", inView ? "opacity-100" : "opacity-0", className)}
  >{inView ? children : <div className="h-96 flex items-center justify-center text-muted-foreground/30">Loading...</div>}</div>;
};
var stdin_default = LazySection;
export {
  stdin_default as default
};

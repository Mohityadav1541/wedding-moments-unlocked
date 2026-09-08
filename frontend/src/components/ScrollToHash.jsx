import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const ScrollToHash = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const scrollToElement = () => {
        const element = document.getElementById(hash.replace("#", ""));
        if (element) {
          const headerOffset = 85;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
          setTimeout(() => {
            const newElementPosition = element.getBoundingClientRect().top;
            if (Math.abs(newElementPosition - headerOffset) > 10) {
              const newOffsetPosition = newElementPosition + window.pageYOffset - headerOffset;
              window.scrollTo({ top: newOffsetPosition, behavior: "smooth" });
            }
          }, 500);
          return true;
        }
        return false;
      };
      if (!scrollToElement()) {
        let retries = 0;
        const interval = setInterval(() => {
          retries++;
          if (scrollToElement() || retries > 50) {
            clearInterval(interval);
          }
        }, 100);
      }
    }
  }, [hash]);
  return null;
};
var stdin_default = ScrollToHash;
export {
  stdin_default as default
};

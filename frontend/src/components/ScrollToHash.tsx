import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToHash = () => {
    const { hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // Improved scroll logic
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

                    // Double-check position after 500ms in case of layout shift (e.g., lazy loading)
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

            // Retry for dynamic content
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

export default ScrollToHash;

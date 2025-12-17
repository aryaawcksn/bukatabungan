import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopProps {
  bottomOffset?: string;
}

export default function ScrollToTop({ bottomOffset = 'bottom-6' }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down - throttled for mobile performance
  useEffect(() => {
    let ticking = false;
    
    const toggleVisibility = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.pageYOffset > 300) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed ${bottomOffset} right-6 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg md:hover:shadow-xl md:transition-all md:duration-300 md:hover:scale-110 mobile-button-press`}
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
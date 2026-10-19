import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every page navigation starts from the top (0, 0),
 * resetting both window/document scroll and all overflow-y scrollable containers (like <main>).
 */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // 1. Reset standard window and document scrolling
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 2. Reset any overflow-y-auto scrollable containers (e.g. Layout <main>)
    const scrollContainers = document.querySelectorAll<HTMLElement>(
      'main, .overflow-y-auto, [data-scroll-container]'
    );
    scrollContainers.forEach((container) => {
      container.scrollTop = 0;
      if (typeof container.scrollTo === 'function') {
        container.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    });
  }, [pathname, search, hash]);

  return null;
}

import { useEffect, useState, useRef } from "react";

/**
 * Returns `hidden = true` when the user scrolls down past `threshold`,
 * and `false` when scrolling back up. Uses window scroll.
 */
export function useHideOnScroll(threshold = 12) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const dy = y - lastY.current;
      if (Math.abs(dy) < threshold) return;
      if (y < 40) {
        setHidden(false);
      } else if (dy > 0) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return hidden;
}

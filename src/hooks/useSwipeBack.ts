import { useEffect, useRef } from "react";

/**
 * Enables an edge-swipe (from left edge) to close/pop an overlay,
 * mirroring iOS interactive back gesture. Attach the returned ref
 * to the scroll container of the overlay.
 */
export function useSwipeBack(active: boolean, onBack: () => void) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      // Only start when touch begins near the left edge
      if (t.clientX > 24) return;
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      // Cancel if primarily vertical
      if (dy > 40 && dy > dx) tracking = false;
    };

    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      tracking = false;
      if (dx > 80 && dy < 60) {
        onBack();
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [active, onBack]);

  return ref;
}

export default useSwipeBack;

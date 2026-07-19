import { useRef, useCallback } from "react";
import { haptic } from "@/lib/despia";

interface Options {
  delay?: number;
  moveTolerance?: number;
}

/**
 * Attach to any element's onTouchStart/End/Move + onMouseDown/Up/Leave
 * to fire `onLongPress` after `delay` ms without significant movement.
 * Fires a heavy haptic on trigger.
 */
export function useLongPress(onLongPress: () => void, { delay = 450, moveTolerance = 8 }: Options = {}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startRef.current = null;
  }, []);

  const start = useCallback(
    (x: number, y: number) => {
      firedRef.current = false;
      startRef.current = { x, y };
      timerRef.current = setTimeout(() => {
        firedRef.current = true;
        haptic("heavy");
        onLongPress();
      }, delay);
    },
    [delay, onLongPress]
  );

  const move = useCallback(
    (x: number, y: number) => {
      if (!startRef.current) return;
      const dx = Math.abs(x - startRef.current.x);
      const dy = Math.abs(y - startRef.current.y);
      if (dx > moveTolerance || dy > moveTolerance) cancel();
    },
    [cancel, moveTolerance]
  );

  return {
    handlers: {
      onTouchStart: (e: React.TouchEvent) => {
        const t = e.touches[0];
        start(t.clientX, t.clientY);
      },
      onTouchMove: (e: React.TouchEvent) => {
        const t = e.touches[0];
        move(t.clientX, t.clientY);
      },
      onTouchEnd: cancel,
      onTouchCancel: cancel,
      onMouseDown: (e: React.MouseEvent) => start(e.clientX, e.clientY),
      onMouseMove: (e: React.MouseEvent) => move(e.clientX, e.clientY),
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    },
    didFire: () => firedRef.current,
  };
}

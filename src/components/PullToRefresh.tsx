import { useRef, useState, useCallback, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { haptic } from "@/lib/despia";

interface PullToRefreshProps {
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
  className?: string;
  /** Pixel distance the user must pull to trigger a refresh. */
  threshold?: number;
}

/**
 * Native-feeling pull-to-refresh wrapper for scrollable screens. Only activates
 * when the inner scroll container is already at the top, so it never interferes
 * with regular scrolling. Emits a light haptic when the user crosses the
 * trigger threshold.
 */
const PullToRefresh = ({
  onRefresh,
  children,
  className = "",
  threshold = 72,
}: PullToRefreshProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const armed = useRef(false);
  const crossedThreshold = useRef(false);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    armed.current = true;
    crossedThreshold.current = false;
  }, [refreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!armed.current || startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) {
      setPull(0);
      return;
    }
    // Rubber-band damping so it doesn't feel unlimited.
    const damped = Math.min(dy * 0.5, threshold * 1.4);
    setPull(damped);
    if (!crossedThreshold.current && damped >= threshold) {
      crossedThreshold.current = true;
      haptic("light");
    }
  }, [threshold]);

  const finish = useCallback(async () => {
    if (!armed.current) return;
    armed.current = false;
    startY.current = null;

    if (crossedThreshold.current && !refreshing) {
      setRefreshing(true);
      setPull(threshold);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  }, [onRefresh, refreshing, threshold]);

  const progress = Math.min(1, pull / threshold);

  return (
    <div className={`relative ${className}`}>
      {/* Indicator */}
      <div
        className="pointer-events-none absolute left-0 right-0 flex items-start justify-center overflow-hidden transition-[height] duration-150"
        style={{ height: pull, top: 0 }}
      >
        <div
          className="mt-3 w-9 h-9 rounded-full bg-card card-shadow flex items-center justify-center"
          style={{ transform: `scale(${0.6 + progress * 0.4})`, opacity: 0.4 + progress * 0.6 }}
        >
          <RefreshCw
            className={`w-4 h-4 text-primary ${refreshing ? "animate-spin" : ""}`}
            style={{ transform: refreshing ? undefined : `rotate(${progress * 270}deg)` }}
          />
        </div>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={finish}
        onTouchCancel={finish}
        className="h-full overflow-y-auto scrollbar-none"
        style={{ transform: `translateY(${pull}px)`, transition: pull === 0 ? "transform 200ms" : undefined }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;

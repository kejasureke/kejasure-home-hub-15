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
 * Native-feeling pull-to-refresh wrapper for screens that scroll at the
 * window/body level (the default in this app). Only arms when the page is
 * scrolled to the very top so it never fights regular scrolling.
 * Emits a light haptic when the user crosses the trigger threshold.
 */
const PullToRefresh = ({
  onRefresh,
  children,
  className = "",
  threshold = 72,
}: PullToRefreshProps) => {
  const startY = useRef<number | null>(null);
  const armed = useRef(false);
  const crossedThreshold = useRef(false);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const atTop = () =>
    (window.scrollY || document.documentElement.scrollTop || 0) <= 0;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return;
    if (!atTop()) return;
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
    <div
      className={`relative ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={finish}
      onTouchCancel={finish}
    >
      {/* Indicator */}
      <div
        className="pointer-events-none fixed left-0 right-0 z-40 flex items-start justify-center overflow-hidden transition-[height] duration-150"
        style={{
          height: pull,
          top: "var(--safe-area-top, env(safe-area-inset-top, 0px))",
        }}
      >
        <div
          className="mt-2 w-9 h-9 rounded-full bg-card card-shadow flex items-center justify-center"
          style={{
            transform: `scale(${0.6 + progress * 0.4})`,
            opacity: 0.4 + progress * 0.6,
          }}
        >
          <RefreshCw
            className={`w-4 h-4 text-primary ${refreshing ? "animate-spin" : ""}`}
            style={{
              transform: refreshing ? undefined : `rotate(${progress * 270}deg)`,
            }}
          />
        </div>
      </div>

      <div
        style={{
          transform: `translateY(${pull}px)`,
          transition: pull === 0 ? "transform 200ms" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;

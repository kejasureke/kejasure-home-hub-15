import { useRef, useState } from "react";
import { MessageCircle, Calendar, Home, TrendingDown, ShieldCheck, Bell, X } from "lucide-react";
import type { InAppAlert } from "@/hooks/useInAppNotifications";

const iconMap: Record<InAppAlert["type"], typeof Bell> = {
  message: MessageCircle,
  booking: Calendar,
  listing: Home,
  price: TrendingDown,
  verified: ShieldCheck,
  system: Bell,
};

const colorMap: Record<InAppAlert["type"], string> = {
  message: "bg-primary/10 text-primary",
  booking: "bg-trust/10 text-trust",
  listing: "bg-primary/10 text-primary",
  price: "bg-accent/10 text-accent",
  verified: "bg-primary/10 text-primary",
  system: "bg-secondary text-foreground",
};

interface Props {
  alert: InAppAlert;
  onDismiss: () => void;
  onTap?: () => void;
}

const SWIPE_THRESHOLD = 80;
const VERTICAL_THRESHOLD = 50;

const NotificationToast = ({ alert, onDismiss, onTap }: Props) => {
  const Icon = iconMap[alert.type];
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dismissing, setDismissing] = useState<"left" | "right" | "up" | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const swiping = useRef(false);
  const axis = useRef<"x" | "y" | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    swiping.current = false;
    axis.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!axis.current) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
    }

    if (axis.current === "x") {
      swiping.current = true;
      setOffsetX(dx);
    } else if (axis.current === "y" && dy < 0) {
      swiping.current = true;
      setOffsetY(dy);
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(offsetX) > SWIPE_THRESHOLD) {
      const dir = offsetX > 0 ? "right" : "left";
      setDismissing(dir);
      if (navigator.vibrate) navigator.vibrate(20);
      setTimeout(() => onDismiss(), 200);
    } else if (offsetY < -VERTICAL_THRESHOLD) {
      setDismissing("up");
      if (navigator.vibrate) navigator.vibrate(20);
      setTimeout(() => onDismiss(), 200);
    } else {
      setOffsetX(0);
      setOffsetY(0);
    }
  };

  const handleClick = () => {
    if (!swiping.current) onTap?.();
  };

  const transform = dismissing === "left"
    ? "translateX(-120%)"
    : dismissing === "right"
    ? "translateX(120%)"
    : dismissing === "up"
    ? "translateY(-120%)"
    : `translate(${offsetX}px, ${offsetY}px)`;

  const opacity = dismissing
    ? 0
    : Math.max(0.3, 1 - Math.max(Math.abs(offsetX) / 200, Math.abs(offsetY) / 150));

  return (
    <div className="fixed top-4 left-3 right-3 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 max-w-lg mx-auto">
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex items-start gap-3 p-3.5 rounded-2xl bg-card card-shadow border border-border cursor-pointer touch-pan-y select-none"
        style={{
          transform,
          opacity,
          transition: offsetX === 0 && offsetY === 0 && !dismissing ? "transform 200ms, opacity 200ms" : dismissing ? "transform 200ms, opacity 200ms" : "none",
        }}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[alert.type]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground line-clamp-1">{alert.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{alert.body}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;

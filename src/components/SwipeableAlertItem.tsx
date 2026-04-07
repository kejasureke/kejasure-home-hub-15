import { useRef, useState } from "react";
import { Bell, MessageCircle, Calendar, Home, TrendingDown, ShieldCheck, Clock, ChevronRight, Trash2 } from "lucide-react";
import type { InAppAlert } from "@/hooks/useInAppNotifications";

const iconMap: Record<string, typeof Bell> = {
  message: MessageCircle,
  booking: Calendar,
  listing: Home,
  price: TrendingDown,
  verified: ShieldCheck,
  system: Bell,
};

const colorMap: Record<string, string> = {
  message: "bg-primary/10 text-primary",
  booking: "bg-trust/10 text-trust",
  listing: "bg-primary/10 text-primary",
  price: "bg-accent/10 text-accent",
  verified: "bg-primary/10 text-primary",
  system: "bg-secondary text-foreground",
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
  return "Yesterday";
}

interface Props {
  alert: InAppAlert;
  onTap?: (id: string) => void;
  onDismiss?: (id: string) => void;
  indented?: boolean;
}

const THRESHOLD = -80;

const SwipeableAlertItem = ({ alert, onTap, onDismiss, indented }: Props) => {
  const [offsetX, setOffsetX] = useState(0);
  const [removing, setRemoving] = useState(false);
  const startX = useRef(0);
  const swiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    swiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    if (dx < -10) swiping.current = true;
    setOffsetX(Math.max(Math.min(dx, 0), -120));
  };

  const handleTouchEnd = () => {
    if (offsetX < THRESHOLD) {
      setRemoving(true);
      setTimeout(() => onDismiss?.(alert.id), 250);
    } else {
      setOffsetX(0);
    }
  };

  const handleClick = () => {
    if (!swiping.current) onTap?.(alert.id);
  };

  const Icon = iconMap[alert.type] || Bell;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl transition-all duration-250 ${
        removing ? "max-h-0 opacity-0 mb-0" : "max-h-40 opacity-100 mb-1.5"
      } ${indented ? "ml-3" : ""}`}
      style={indented ? { width: "calc(100% - 12px)" } : undefined}
    >
      {/* Delete background */}
      <div className="absolute inset-0 bg-destructive flex items-center justify-end pr-5 rounded-2xl">
        <Trash2 className="w-5 h-5 text-destructive-foreground" />
      </div>

      {/* Swipeable card */}
      <div
        className={`relative transition-transform ${offsetX === 0 && !removing ? "duration-200" : "duration-0"} ${
          alert.read ? "bg-card" : "bg-primary/5 border border-primary/10"
        } rounded-2xl`}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="flex items-start gap-3 p-3.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorMap[alert.type]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold line-clamp-1 ${!alert.read ? "text-foreground" : "text-foreground/80"}`}>
                {alert.title}
              </p>
              {!alert.read && <div className="w-2 h-2 rounded-full bg-accent shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{alert.body}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <Clock className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-[10px] text-muted-foreground/60">{timeAgo(alert.timestamp)}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-1" />
        </div>
      </div>
    </div>
  );
};

export default SwipeableAlertItem;

import { useRef, useState } from "react";
import { Home, Calendar, TrendingDown, ShieldCheck, Clock, ChevronRight, Trash2 } from "lucide-react";
import type { Notification } from "@/hooks/useNotifications";

const iconMap = {
  listing: Home,
  booking: Calendar,
  price: TrendingDown,
  verified: ShieldCheck,
};

const colorMap = {
  listing: "bg-primary/10 text-primary",
  booking: "bg-trust/10 text-trust",
  price: "bg-accent/10 text-accent",
  verified: "bg-primary/10 text-primary",
};

interface Props {
  notification: Notification;
  onDismiss: (id: string) => void;
  onTap: (id: string) => void;
}

const THRESHOLD = -80;

const SwipeableNotification = ({ notification, onDismiss, onTap }: Props) => {
  const [offsetX, setOffsetX] = useState(0);
  const [removing, setRemoving] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    swiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    if (dx < -10) swiping.current = true;
    const clamped = Math.max(Math.min(dx, 0), -120);
    currentX.current = e.touches[0].clientX;
    setOffsetX(clamped);
  };

  const handleTouchEnd = () => {
    if (offsetX < THRESHOLD) {
      if (navigator.vibrate) navigator.vibrate(30);
      setRemoving(true);
      setTimeout(() => onDismiss(notification.id), 250);
    } else {
      setOffsetX(0);
    }
  };

  const handleClick = () => {
    if (!swiping.current) onTap(notification.id);
  };

  const Icon = iconMap[notification.type];

  return (
    <div className={`relative overflow-hidden rounded-2xl transition-all duration-250 ${removing ? "max-h-0 opacity-0 mb-0" : "max-h-40 opacity-100 mb-2"}`}>
      {/* Delete background */}
      <div className="absolute inset-0 bg-destructive flex items-center justify-end pr-5 rounded-2xl">
        <Trash2 className="w-5 h-5 text-destructive-foreground" />
      </div>

      {/* Swipeable card */}
      <div
        className={`relative transition-transform ${offsetX === 0 && !removing ? "duration-200" : "duration-0"} ${
          notification.read ? "bg-card" : "bg-primary/5 border border-primary/10"
        } rounded-2xl`}
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="flex items-start gap-3 p-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[notification.type]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold line-clamp-1 ${!notification.read ? "text-foreground" : "text-foreground/80"}`}>
                {notification.title}
              </p>
              {!notification.read && <div className="w-2 h-2 rounded-full bg-accent shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.description}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <Clock className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-[10px] text-muted-foreground/60">{notification.time}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-1" />
        </div>
      </div>
    </div>
  );
};

export default SwipeableNotification;

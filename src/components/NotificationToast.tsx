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

const NotificationToast = ({ alert, onDismiss, onTap }: Props) => {
  const Icon = iconMap[alert.type];

  return (
    <div className="fixed top-4 left-3 right-3 z-[100] animate-in slide-in-from-top-4 fade-in duration-300 max-w-lg mx-auto">
      <div
        onClick={onTap}
        className="flex items-start gap-3 p-3.5 rounded-2xl bg-card card-shadow border border-border cursor-pointer"
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
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;

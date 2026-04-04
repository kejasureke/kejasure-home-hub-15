import { ArrowLeft, Home, Calendar, TrendingDown, ShieldCheck, Bell, Clock, ChevronRight } from "lucide-react";

interface NotificationsScreenProps {
  onBack: () => void;
}

const notifications = [
  {
    id: "1",
    type: "listing" as const,
    title: "New listing in Kilimani",
    description: "A verified 2BR apartment just listed at KES 45,000/mo — matches your saved search.",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "booking" as const,
    title: "Viewing confirmed",
    description: "Your viewing for 'Modern 2BR with Pool' is confirmed for tomorrow at 10:00 AM.",
    time: "1 hr ago",
    read: false,
  },
  {
    id: "3",
    type: "price" as const,
    title: "Price drop alert",
    description: "Luxurious 3BR in Kilimani dropped from KES 95,000 to KES 85,000/mo.",
    time: "3 hrs ago",
    read: false,
  },
  {
    id: "4",
    type: "verified" as const,
    title: "Landlord verified",
    description: "The landlord for 'Cozy Studio in Westlands' has been ID-verified.",
    time: "5 hrs ago",
    read: true,
  },
  {
    id: "5",
    type: "booking" as const,
    title: "Booking request accepted",
    description: "Your short stay booking at Diani Beachfront Villa has been accepted. Check-in details sent.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "6",
    type: "listing" as const,
    title: "3 new listings in Westlands",
    description: "New properties matching your filters are now available.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "7",
    type: "price" as const,
    title: "Price drop in Lavington",
    description: "Furnished 1BR dropped by 15% — now KES 38,000/mo.",
    time: "2 days ago",
    read: true,
  },
];

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

const NotificationsScreen = ({ onBack }: NotificationsScreenProps) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="gradient-trust px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-xs text-primary-foreground/70">{unreadCount} unread</p>
            )}
          </div>
          <button className="text-xs text-primary-foreground/70 font-medium px-3 py-1.5 rounded-full bg-primary-foreground/10">
            Mark all read
          </button>
        </div>
      </div>

      {/* Today */}
      <div className="px-4 pt-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today</h2>
        <div className="space-y-2">
          {notifications
            .filter((n) => !n.time.includes("Yesterday") && !n.time.includes("days"))
            .map((notification) => {
              const Icon = iconMap[notification.type];
              return (
                <button
                  key={notification.id}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-2xl transition-colors active:scale-[0.98] ${
                    notification.read ? "bg-card" : "bg-primary/5 border border-primary/10"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[notification.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold line-clamp-1 ${!notification.read ? "text-foreground" : "text-foreground/80"}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.description}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock className="w-3 h-3 text-muted-foreground/60" />
                      <span className="text-[10px] text-muted-foreground/60">{notification.time}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-1" />
                </button>
              );
            })}
        </div>
      </div>

      {/* Earlier */}
      <div className="px-4 pt-5">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Earlier</h2>
        <div className="space-y-2">
          {notifications
            .filter((n) => n.time.includes("Yesterday") || n.time.includes("days"))
            .map((notification) => {
              const Icon = iconMap[notification.type];
              return (
                <button
                  key={notification.id}
                  className="w-full flex items-start gap-3 p-3.5 rounded-2xl bg-card transition-colors active:scale-[0.98]"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[notification.type]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-foreground/80 line-clamp-1">{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.description}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock className="w-3 h-3 text-muted-foreground/60" />
                      <span className="text-[10px] text-muted-foreground/60">{notification.time}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-1" />
                </button>
              );
            })}
        </div>
      </div>

      {/* Empty state footer */}
      <div className="px-4 pt-6 pb-4 text-center">
        <Bell className="w-5 h-5 text-muted-foreground/30 mx-auto mb-1" />
        <p className="text-[10px] text-muted-foreground/40">You're all caught up</p>
      </div>
    </div>
  );
};

export default NotificationsScreen;

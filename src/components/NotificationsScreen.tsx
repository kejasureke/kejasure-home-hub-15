import { ArrowLeft, Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import SwipeableNotification from "./SwipeableNotification";

interface NotificationsScreenProps {
  onBack: () => void;
}

const NotificationsScreen = ({ onBack }: NotificationsScreenProps) => {
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications();

  const todayNotifs = notifications.filter((n) => !n.time.includes("Yesterday") && !n.time.includes("days"));
  const earlierNotifs = notifications.filter((n) => n.time.includes("Yesterday") || n.time.includes("days"));

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
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary-foreground/70 font-medium px-3 py-1.5 rounded-full bg-primary-foreground/10"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Bell className="w-10 h-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">No notifications</p>
          <p className="text-xs text-muted-foreground/60 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <>
          {todayNotifs.length > 0 && (
            <div className="px-4 pt-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today</h2>
              {todayNotifs.map((n) => (
                <SwipeableNotification key={n.id} notification={n} onDismiss={dismiss} onTap={markRead} />
              ))}
            </div>
          )}

          {earlierNotifs.length > 0 && (
            <div className="px-4 pt-5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Earlier</h2>
              {earlierNotifs.map((n) => (
                <SwipeableNotification key={n.id} notification={n} onDismiss={dismiss} onTap={markRead} />
              ))}
            </div>
          )}

          <div className="px-4 pt-6 pb-4 text-center">
            <Bell className="w-5 h-5 text-muted-foreground/30 mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground/40">Swipe left to dismiss</p>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsScreen;

import { ArrowLeft, Bell, MessageCircle, Calendar, Home, TrendingDown, ShieldCheck, Volume2, VolumeX, Clock, ChevronRight, ChevronDown, Trash2, Undo2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import type { InAppAlert } from "@/hooks/useInAppNotifications";
import SwipeableNotification from "./SwipeableNotification";
import SwipeableAlertItem from "./SwipeableAlertItem";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";

interface NotificationsScreenProps {
  onBack: () => void;
  liveAlerts?: InAppAlert[];
  onMarkAlertRead?: (id: string) => void;
  onMarkAllAlertsRead?: () => void;
  onDismissAlert?: (id: string) => void;
  onRestoreAlert?: (alert: InAppAlert) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

const categoryFilters = ["All", "Messages", "Bookings", "Listings", "Price", "Verified"] as const;

const alertTypeLabel: Record<string, string> = {
  message: "Messages",
  booking: "Bookings",
  listing: "Listings",
  price: "Price Alerts",
  verified: "Verified",
  system: "System",
};

const alertIconMap: Record<string, typeof Bell> = {
  message: MessageCircle,
  booking: Calendar,
  listing: Home,
  price: TrendingDown,
  verified: ShieldCheck,
  system: Bell,
};

const alertColorMap: Record<string, string> = {
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

const NotificationsScreen = ({
  onBack,
  liveAlerts = [],
  onMarkAlertRead,
  onMarkAllAlertsRead,
  onDismissAlert,
  onRestoreAlert,
  soundEnabled = true,
  onToggleSound,
}: NotificationsScreenProps) => {
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications();
  const [filter, setFilter] = useState<(typeof categoryFilters)[number]>("All");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [undoItem, setUndoItem] = useState<{ alert: InAppAlert; source: "live" | "stored" } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [undoProgress, setUndoProgress] = useState(100);
  const undoAnimRef = useRef<number | null>(null);
  const undoStartRef = useRef<number>(0);
  const UNDO_DURATION = 5000;

  // Detail sheet for tapped notifications
  type DetailItem = {
    id: string;
    type: string;
    title: string;
    description: string;
    timeLabel: string;
    source: "stored" | "live";
  };
  const [detailItem, setDetailItem] = useState<DetailItem | null>(null);
  const [detailClosing, setDetailClosing] = useState(false);

  const closeDetail = useCallback(() => {
    setDetailClosing(true);
    setTimeout(() => {
      setDetailItem(null);
      setDetailClosing(false);
    }, 200);
  }, []);

  const openStoredDetail = useCallback((id: string) => {
    const n = notifications.find((x) => x.id === id);
    if (!n) return;
    markRead(id);
    setDetailItem({ id: n.id, type: n.type, title: n.title, description: n.description, timeLabel: n.time, source: "stored" });
  }, [notifications, markRead]);

  const openLiveDetail = useCallback((id: string) => {
    const a = liveAlerts.find((x) => x.id === id);
    if (!a) return;
    onMarkAlertRead?.(id);
    setDetailItem({ id: a.id, type: a.type, title: a.title, description: a.body, timeLabel: timeAgo(a.timestamp), source: "live" });
  }, [liveAlerts, onMarkAlertRead]);

  const detailActionLabel = (type: string) => {
    switch (type) {
      case "listing": return "View Listing";
      case "booking": return "View Booking";
      case "price": return "View Property";
      case "verified": return "View Profile";
      case "message": return "Open Chat";
      default: return "View Details";
    }
  };

  const stopUndoAnim = useCallback(() => {
    if (undoAnimRef.current) cancelAnimationFrame(undoAnimRef.current);
  }, []);

  const startUndoAnim = useCallback(() => {
    undoStartRef.current = Date.now();
    setUndoProgress(100);
    const tick = () => {
      const elapsed = Date.now() - undoStartRef.current;
      const remaining = Math.max(0, 100 - (elapsed / UNDO_DURATION) * 100);
      setUndoProgress(remaining);
      if (remaining > 0) {
        undoAnimRef.current = requestAnimationFrame(tick);
      }
    };
    undoAnimRef.current = requestAnimationFrame(tick);
  }, [UNDO_DURATION]);

  const clearUndo = useCallback(() => {
    setUndoItem(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    stopUndoAnim();
  }, [stopUndoAnim]);

  const handleDismissAlert = useCallback((id: string) => {
    const alert = liveAlerts.find((a) => a.id === id);
    if (alert) {
      setUndoItem({ alert, source: "live" });
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      stopUndoAnim();
      undoTimerRef.current = setTimeout(() => setUndoItem(null), UNDO_DURATION);
      startUndoAnim();
    }
    onDismissAlert?.(id);
  }, [liveAlerts, onDismissAlert, stopUndoAnim, startUndoAnim, UNDO_DURATION]);

  const handleDismissStored = useCallback((id: string) => {
    // Stored notifications don't support restore, just dismiss
    dismiss(id);
  }, [dismiss]);

  const handleUndo = useCallback(() => {
    if (undoItem?.source === "live" && onRestoreAlert) {
      onRestoreAlert(undoItem.alert);
    }
    clearUndo();
  }, [undoItem, onRestoreAlert, clearUndo]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      stopUndoAnim();
    };
  }, [stopUndoAnim]);

  const totalUnread = unreadCount + liveAlerts.filter((a) => !a.read).length;

  const filterType = (f: typeof filter) => {
    const map: Record<string, string> = {
      Messages: "message",
      Bookings: "booking",
      Listings: "listing",
      Price: "price",
      Verified: "verified",
    };
    return map[f] || null;
  };

  const filteredNotifications =
    filter === "All"
      ? notifications
      : notifications.filter((n) => n.type === filterType(filter));

  const filteredAlerts =
    filter === "All"
      ? liveAlerts
      : liveAlerts.filter((a) => a.type === filterType(filter));

  // Group alerts by type
  const groupedAlerts = useMemo(() => {
    const groups: Record<string, InAppAlert[]> = {};
    filteredAlerts.forEach((a) => {
      if (!groups[a.type]) groups[a.type] = [];
      groups[a.type].push(a);
    });
    // Sort groups: most recent first
    return Object.entries(groups).sort(
      ([, a], [, b]) => Math.max(...b.map((x) => x.timestamp)) - Math.max(...a.map((x) => x.timestamp))
    );
  }, [filteredAlerts]);

  const toggleGroup = (type: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const todayNotifs = filteredNotifications.filter(
    (n) => !n.time.includes("Yesterday") && !n.time.includes("days")
  );
  const earlierNotifs = filteredNotifications.filter(
    (n) => n.time.includes("Yesterday") || n.time.includes("days")
  );

  const handleMarkAllRead = () => {
    markAllRead();
    onMarkAllAlertsRead?.();
  };

  return (
    <div className="pb-32">
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
            <h1 className="text-lg font-bold text-primary-foreground">Notification Center</h1>
            {totalUnread > 0 && (
              <p className="text-xs text-primary-foreground/70">{totalUnread} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onToggleSound && (
              <button
                onClick={onToggleSound}
                className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <VolumeX className="w-4 h-4 text-primary-foreground/60" />
                )}
              </button>
            )}
            {totalUnread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary-foreground/70 font-medium px-3 py-1.5 rounded-full bg-primary-foreground/10"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === cat
                  ? "bg-primary-foreground text-primary"
                  : "bg-primary-foreground/10 text-primary-foreground/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredAlerts.length === 0 && filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Bell className="w-10 h-10 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">No notifications</p>
          <p className="text-xs text-muted-foreground/60 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <>
          {/* Live alerts section — grouped by type */}
          {groupedAlerts.length > 0 && (
            <div className="px-4 pt-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Live Updates
              </h2>
              {groupedAlerts.map(([type, alerts]) => {
                const GroupIcon = alertIconMap[type] || Bell;
                const unreadInGroup = alerts.filter((a) => !a.read).length;
                const isCollapsed = collapsedGroups.has(type);

                return (
                  <div key={type} className="mb-3">
                    {/* Group header */}
                    <button
                      onClick={() => toggleGroup(type)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-card card-shadow mb-1.5"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${alertColorMap[type]}`}>
                        <GroupIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold flex-1 text-left">{alertTypeLabel[type] || type}</span>
                      {unreadInGroup > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {unreadInGroup}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{alerts.length}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                    </button>

                    {/* Group items */}
                    {!isCollapsed && alerts.map((alert) => (
                      <SwipeableAlertItem
                        key={alert.id}
                        alert={alert}
                        onTap={openLiveDetail}
                        onDismiss={handleDismissAlert}
                        indented
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Stored notifications */}
          {todayNotifs.length > 0 && (
            <div className="px-4 pt-4">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today</h2>
              {todayNotifs.map((n) => (
                <SwipeableNotification key={n.id} notification={n} onDismiss={dismiss} onTap={openStoredDetail} />
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

      {/* Undo snackbar */}
      {undoItem && (
        <div className="fixed bottom-24 left-4 right-4 z-50 max-w-lg mx-auto animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="rounded-2xl bg-foreground text-background shadow-lg overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Trash2 className="w-4 h-4 shrink-0 opacity-70" />
              <p className="text-sm flex-1 truncate">Notification dismissed</p>
              <button
                onClick={handleUndo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background/15 text-sm font-semibold active:scale-95 transition-transform"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Undo
              </button>
            </div>
            <div className="h-1 w-full bg-background/10">
              <div
                className="h-full bg-primary transition-none"
                style={{ width: `${undoProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;

import { useState, useCallback } from "react";

export interface Notification {
  id: string;
  type: "listing" | "booking" | "price" | "verified";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const defaultNotifications: Notification[] = [
  { id: "1", type: "listing", title: "New listing in Kilimani", description: "A verified 2BR apartment just listed at KES 45,000/mo — matches your saved search.", time: "2 min ago", read: false },
  { id: "2", type: "booking", title: "Viewing confirmed", description: "Your viewing for 'Modern 2BR with Pool' is confirmed for tomorrow at 10:00 AM.", time: "1 hr ago", read: false },
  { id: "3", type: "price", title: "Price drop alert", description: "Luxurious 3BR in Kilimani dropped from KES 95,000 to KES 85,000/mo.", time: "3 hrs ago", read: false },
  { id: "4", type: "verified", title: "Landlord verified", description: "The landlord for 'Cozy Studio in Westlands' has been ID-verified.", time: "5 hrs ago", read: true },
  { id: "5", type: "booking", title: "Booking request accepted", description: "Your short stay booking at Diani Beachfront Villa has been accepted. Check-in details sent.", time: "Yesterday", read: true },
  { id: "6", type: "listing", title: "3 new listings in Westlands", description: "New properties matching your filters are now available.", time: "Yesterday", read: true },
  { id: "7", type: "price", title: "Price drop in Lavington", description: "Furnished 1BR dropped by 15% — now KES 38,000/mo.", time: "2 days ago", read: true },
];

const STORAGE_KEY = "kejasure_notifications";
const DISMISSED_KEY = "kejasure_dismissed_notifications";
const READ_KEY = "kejasure_read_notifications";

function loadSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

export const useNotifications = () => {
  const [dismissed, setDismissed] = useState<Set<string>>(() => loadSet(DISMISSED_KEY));
  const [readIds, setReadIds] = useState<Set<string>>(() => loadSet(READ_KEY));

  const notifications = defaultNotifications
    .filter((n) => !dismissed.has(n.id))
    .map((n) => ({ ...n, read: n.read || readIds.has(n.id) }));

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(READ_KEY, next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      defaultNotifications.forEach((n) => next.add(n.id));
      saveSet(READ_KEY, next);
      return next;
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSet(DISMISSED_KEY, next);
      return next;
    });
  }, []);

  return { notifications, unreadCount, markRead, markAllRead, dismiss };
};

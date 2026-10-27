import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  type: "listing" | "booking" | "price" | "verified";
  title: string;
  description: string;
  time: string;
  read: boolean;
  deepLink?: string | null;
}

const KNOWN = ["listing", "booking", "price", "verified"];

function relTime(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

type Row = { id: string; type: string; title: string; body: string | null; created_at: string; read_at: string | null; deep_link: string | null };

const toNotif = (r: Row): Notification => ({
  id: r.id,
  type: (KNOWN.includes(r.type) ? r.type : "listing") as Notification["type"],
  title: r.title,
  description: r.body ?? "",
  time: relTime(r.created_at),
  read: !!r.read_at,
  deepLink: r.deep_link,
});

export const useNotifications = () => {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase
        .from("notifications")
        .select("id,type,title,body,created_at,read_at,deep_link")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (!cancelled && data) setRows(data as Row[]);
      channel = supabase
        .channel(`notifications-${user.id}-${Math.random().toString(36).slice(2)}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (p) => {
          if (p.eventType === "INSERT") setRows((prev) => [p.new as Row, ...prev]);
          else if (p.eventType === "UPDATE") setRows((prev) => prev.map((r) => (r.id === (p.new as Row).id ? (p.new as Row) : r)));
          else if (p.eventType === "DELETE") setRows((prev) => prev.filter((r) => r.id !== (p.old as Row).id));
        })
        .subscribe();
    })();
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const notifications = rows.map(toNotif);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback((id: string) => {
    const now = new Date().toISOString();
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read_at: now } : r)));
    supabase.from("notifications").update({ read_at: now }).eq("id", id).then(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    const now = new Date().toISOString();
    setRows((prev) => {
      const ids = prev.filter((r) => !r.read_at).map((r) => r.id);
      if (ids.length) supabase.from("notifications").update({ read_at: now }).in("id", ids).then(() => {});
      return prev.map((r) => ({ ...r, read_at: r.read_at ?? now }));
    });
  }, []);

  const dismiss = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    supabase.from("notifications").delete().eq("id", id).then(() => {});
  }, []);

  return { notifications, unreadCount, markRead, markAllRead, dismiss };
};

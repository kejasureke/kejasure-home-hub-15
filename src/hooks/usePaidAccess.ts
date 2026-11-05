import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { isActiveSubscription, type SubscriptionWindow } from "@/lib/paidAccess";

/** Fail closed until the current account's subscription has been confirmed. */
export function usePaidAccess() {
  const { user, loading: authLoading } = useAuth();
  type AccountSubscription = SubscriptionWindow & { subscription_plans: { tier: string } | null };
  const [snapshot, setSnapshot] = useState<{ userId: string; subscriptions: AccountSubscription[] } | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setSnapshot(null);
    if (!user) return;
    let cancelled = false;
    const refresh = async () => {
      const { data, error } = await supabase.from("subscriptions")
        .select("status, starts_at, ends_at, subscription_plans(tier)").eq("user_id", user.id).eq("status", "active")
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setSnapshot({ userId: user.id, subscriptions: error ? [] : data ?? [] });
        setNow(Date.now());
      }
    };
    const visible = () => { if (document.visibilityState === "visible") void refresh(); };
    void refresh();
    const interval = window.setInterval(() => { setNow(Date.now()); void refresh(); }, 30000);
    window.addEventListener("focus", refresh);
    window.addEventListener("profile-updated", refresh);
    document.addEventListener("visibilitychange", visible);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("profile-updated", refresh);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [user?.id]);

  const subscriptions = snapshot?.userId === user?.id ? snapshot?.subscriptions ?? [] : [];
  useEffect(() => {
    const nextExpiry = subscriptions.filter((s) => isActiveSubscription(s, now))
      .map((s) => Date.parse(s.ends_at ?? "")).sort((a, b) => a - b)[0];
    if (!nextExpiry) return;
    const timer = window.setTimeout(() => setNow(Date.now()), Math.min(nextExpiry - Date.now() + 1, 2147483647));
    return () => window.clearTimeout(timer);
  }, [snapshot, now]);

  return {
    // Tenants use KejaSure free: any signed-in account can book and chat.
    hasActivePlan: !!user,
    activePlan: subscriptions.find((s) => isActiveSubscription(s, now))?.subscription_plans?.tier ?? null,
    loading: authLoading || (!!user && snapshot?.userId !== user.id),
  };
}
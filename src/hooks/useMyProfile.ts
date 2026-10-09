import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface MyProfile {
  name: string;
  phone: string;
  initials: string;
  phoneVerified: boolean;
  idVerified: boolean;
  /** Active paid plan tier, or null when on the free plan. */
  activePlan: string | null;
  loading: boolean;
  saveName: (name: string) => Promise<boolean>;
}

const readLocal = (k: string) => {
  try { return localStorage.getItem(k) || ""; } catch { return ""; }
};

const formatPhone = (p: string) => {
  const d = p.replace(/\D/g, "");
  if (d.startsWith("254") && d.length === 12) return `+254 ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
  return p;
};

/** The signed-in user's real name, phone, verification and plan — no demo data. */
export const useMyProfile = (): MyProfile => {
  const { user } = useAuth();
  const [name, setName] = useState(() => readLocal("kejasure_display_name"));
  const [phone, setPhone] = useState(() => readLocal("kejasure_phone"));
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [idVerified, setIdVerified] = useState(false);
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const [{ data: prof }, { data: subs }] = await Promise.all([
      supabase.from("profiles").select("full_name, phone, phone_verified, id_verified").eq("id", user.id).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("status, ends_at, subscription_plans(tier)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1),
    ]);
    if (prof?.full_name) setName(prof.full_name);
    if (prof?.phone) setPhone(prof.phone);
    else if (user.phone) setPhone(user.phone);
    // Anyone signed in got here through an SMS code.
    setPhoneVerified(true);
    setIdVerified(!!prof?.id_verified);
    const sub = subs?.[0] as { ends_at: string | null; subscription_plans: { tier: string } | null } | undefined;
    const live = sub && (!sub.ends_at || new Date(sub.ends_at) > new Date());
    setActivePlan(live ? sub?.subscription_plans?.tier ?? null : null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    const h = () => { setName(readLocal("kejasure_display_name")); load(); };
    window.addEventListener("profile-updated", h);
    return () => window.removeEventListener("profile-updated", h);
  }, [load]);

  const saveName = useCallback(async (next: string) => {
    const clean = next.trim().replace(/\s+/g, " ").slice(0, 60);
    if (!clean || !user) return false;
    const { error } = await supabase.from("profiles").update({ full_name: clean }).eq("id", user.id);
    if (error) return false;
    try { localStorage.setItem("kejasure_display_name", clean); } catch {}
    setName(clean);
    window.dispatchEvent(new CustomEvent("profile-updated"));
    return true;
  }, [user]);

  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "";

  return { name, phone: formatPhone(phone), initials, phoneVerified, idVerified, activePlan, loading, saveName };
};

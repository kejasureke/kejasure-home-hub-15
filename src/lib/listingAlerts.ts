import { pushGlobalAlert } from "@/hooks/useInAppNotifications";
import { haptic } from "@/lib/despia";
import { supabase } from "@/integrations/supabase/client";

export interface ListingAlert {
  id: string;
  segment: "rental" | "shortstay" | "commercial" | "corporate" | "any";
  county: string; // "" = anywhere
  estate: string; // "" = any estate
  bedrooms: number; // 0 = any
  maxPrice: number; // 0 = no limit
  createdAt: number;
}

export interface NewListingInfo {
  title: string;
  type: string;
  county: string;
  estate: string;
  bedrooms: number;
  price: number;
}

const KEY = "kejasure_listing_alerts";
export const ALERTS_EVENT = "listing-alerts-updated";

export const readAlerts = (): ListingAlert[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};
const write = (a: ListingAlert[]) => {
  localStorage.setItem(KEY, JSON.stringify(a));
  window.dispatchEvent(new Event(ALERTS_EVENT));
};
export const addAlert = async (a: Omit<ListingAlert, "id" | "createdAt">) => {
  const { data: { user } } = await supabase.auth.getUser();
  let id = `al_${Date.now()}`;
  if (user) {
    const { data } = await supabase.from("listing_alerts").insert({
      user_id: user.id, segment: a.segment, county: a.county, estate: a.estate,
      bedrooms: a.bedrooms, max_price: a.maxPrice,
    }).select("id").single();
    if (data) id = data.id;
  }
  write([{ ...a, id, createdAt: Date.now() }, ...readAlerts()].slice(0, 20));
};
export const removeAlert = async (id: string) => {
  write(readAlerts().filter((a) => a.id !== id));
  if (!id.startsWith("al_")) await supabase.from("listing_alerts").delete().eq("id", id);
};

/** Pull the signed-in user's alerts from the server (source of truth). */
export async function syncAlerts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  // Upload any alerts saved on this phone before syncing existed
  const local = readAlerts().filter((a) => a.id.startsWith("al_"));
  if (local.length) {
    await supabase.from("listing_alerts").insert(local.map((a) => ({
      user_id: user.id, segment: a.segment, county: a.county, estate: a.estate,
      bedrooms: a.bedrooms, max_price: a.maxPrice,
    })));
  }
  const { data } = await supabase.from("listing_alerts").select("*").order("created_at", { ascending: false });
  if (!data) return;
  write(data.map((r) => ({
    id: r.id, segment: r.segment as ListingAlert["segment"], county: r.county, estate: r.estate,
    bedrooms: r.bedrooms, maxPrice: r.max_price, createdAt: new Date(r.created_at).getTime(),
  })));
}

const fmtK = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}K` : String(n));

export const describeAlert = (a: ListingAlert) => {
  const beds = a.bedrooms ? `${a.bedrooms}-bedroom` : a.segment === "shortstay" ? "Short stay" : "Any home";
  const price = a.maxPrice ? ` under ${fmtK(a.maxPrice)}` : "";
  const place = a.estate || a.county || "anywhere";
  return `${beds}${price} in ${place}`;
};

const matches = (a: ListingAlert, l: NewListingInfo) =>
  (a.segment === "any" || a.segment === l.type) &&
  (!a.county || a.county === l.county) &&
  (!a.estate || a.estate === l.estate) &&
  (!a.bedrooms || a.bedrooms === l.bedrooms) &&
  (!a.maxPrice || l.price <= a.maxPrice);

/** Called the moment a listing goes live — fires an alert for every match. */
export function notifyNewListing(l: NewListingInfo) {
  const hit = readAlerts().find((a) => matches(a, l));
  if (!hit) return;
  haptic("success");
  pushGlobalAlert({
    type: "listing",
    title: `New: ${describeAlert(hit)}`,
    body: `${l.title} just listed at KES ${l.price.toLocaleString()}.`,
    action: "open-home",
  });
}

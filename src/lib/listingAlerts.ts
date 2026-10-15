import { pushGlobalAlert } from "@/hooks/useInAppNotifications";
import { haptic } from "@/lib/despia";

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
export const addAlert = (a: Omit<ListingAlert, "id" | "createdAt">) =>
  write([{ ...a, id: `al_${Date.now()}`, createdAt: Date.now() }, ...readAlerts()].slice(0, 20));
export const removeAlert = (id: string) => write(readAlerts().filter((a) => a.id !== id));

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

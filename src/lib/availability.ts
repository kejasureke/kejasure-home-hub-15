import { supabase } from "@/integrations/supabase/client";
import type { ServiceProvider } from "@/data/mockData";

/** How long a request waits for a reply before it closes on its own. */
export const WAIT_LIMIT_MS = { service: 2 * 60 * 60 * 1000, other: 24 * 60 * 60 * 1000 } as const;
export const waitLimitMs = (type: string) => (type === "service" ? WAIT_LIMIT_MS.service : WAIT_LIMIT_MS.other);
/** A home marked as taken stays visible with a "Taken" badge this long. */
export const TAKEN_VISIBLE_MS = 3 * 24 * 60 * 60 * 1000;

export const isRecentlyTaken = (takenAt?: string | null, now = Date.now()) =>
  !!takenAt && now - new Date(takenAt).getTime() < TAKEN_VISIBLE_MS;

/** Turns a booking-rule error from the server into a short message for the tenant or provider. */
export function requestErrorMessage(raw?: string | null): { code: string; message: string } {
  const text = raw || "";
  const m = text.match(/^([A-Z_]+):\s*(.+)$/s);
  if (m) return { code: m[1], message: m[2] };
  if (/3 pending requests/.test(text)) return { code: "PENDING_LIMIT", message: text };
  return { code: "OTHER", message: text || "Couldn't send your request. Please try again." };
}

export const closeReasonLabel = (reason?: string | null) => {
  switch (reason) {
    case "expired": return "Closed: no reply in time";
    case "taken": return "Closed: home was taken";
    case "dates_taken": return "Closed: dates were booked";
    case "slot_full": return "Closed: time slot filled";
    case "unavailable": return "Closed: listing no longer available";
    default: return null;
  }
};

/** "9:00 AM" on a Nairobi date → epoch ms (Kenya is UTC+3 all year). */
export function slotMs(dateISO: string, time: string): number {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const [y, mo, d] = dateISO.split("-").map(Number);
  if (!m || !y) return NaN;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return Date.UTC(y, mo - 1, d, h - 3, Number(m[2]));
}

export type StayRange = { start: string; end: string }; // end = check-out day (not a booked night)
/** A night is booked when start <= night < check-out. */
export const isNightBooked = (night: string, ranges: StayRange[]) => ranges.some((r) => r.start <= night && night < r.end);
/** True when any night in [checkIn, checkOut) is already booked. */
export const rangeHitsBooked = (checkIn: string, checkOut: string, ranges: StayRange[]) =>
  ranges.some((r) => r.start < checkOut && checkIn < r.end);

export async function fetchListingAvailability(listingId: string): Promise<{ stays: StayRange[]; fullSlots: Set<number> }> {
  const { data } = await supabase.rpc("listing_availability", { _listing_id: listingId });
  const stays: StayRange[] = [];
  const fullSlots = new Set<number>();
  (data ?? []).forEach((r: any) => {
    if (r.kind === "stay" && r.start_date) stays.push({ start: r.start_date, end: r.end_date });
    if (r.kind === "slot_full" && r.slot_at) fullSlots.add(new Date(r.slot_at).getTime());
  });
  return { stays, fullSlots };
}

export type ServiceStatus = { busyUntil?: string; busyNow: boolean; openRequests: number; jobCapacity: number };
export async function fetchServiceStatus(ids: string[]): Promise<Record<string, ServiceStatus>> {
  if (!ids.length) return {};
  const { data } = await supabase.rpc("service_status", { _ids: ids });
  const out: Record<string, ServiceStatus> = {};
  (data ?? []).forEach((r: any) => {
    out[r.listing_id] = { busyUntil: r.busy_until ?? undefined, busyNow: !!r.busy_now, openRequests: r.open_requests ?? 0, jobCapacity: r.job_capacity ?? 1 };
  });
  return out;
}

/** Closes requests that waited past the limit (services 2h, homes 24h). Safe to call often. */
export async function expireStaleRequests() {
  try { await supabase.rpc("expire_stale_bookings"); } catch { /* signed out or offline */ }
}

export const formatClock = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Nairobi" }) : "";

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const boostRank = (s: Pick<ServiceProvider, "boostKind">) => (s.boostKind === "gold" ? 3 : s.boostKind === "hotdeal" ? 2 : s.boostKind === "silver" ? 1 : 0);
/** Fewer unanswered requests ranks higher; small differences don't matter. */
const loadBucket = (n = 0) => (n <= 2 ? 0 : n <= 5 ? 1 : 2);

/**
 * Fair order for providers: paid boosts stay on top (even when busy), then available before busy,
 * then providers with fewer unanswered requests, then turns that rotate every hour.
 */
export function fairServiceOrder<T extends ServiceProvider>(list: T[], now = Date.now()): T[] {
  const turn = Math.floor(now / 3_600_000);
  return [...list].sort((a, b) =>
    boostRank(b) - boostRank(a)
    || Number(!!a.busyNow) - Number(!!b.busyNow)
    || loadBucket(a.openRequests) - loadBucket(b.openRequests)
    || hash(`${a.id}:${turn}`) - hash(`${b.id}:${turn}`));
}

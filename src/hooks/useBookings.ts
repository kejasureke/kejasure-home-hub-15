import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { pushGlobalAlert } from "./useInAppNotifications";
import { supabase } from "@/integrations/supabase/client";
import { closeReasonLabel, expireStaleRequests } from "@/lib/availability";

const STORAGE_KEY = "kejasure_bookings";
const EVENT = "bookings-updated";

export type BookingStatus = "pending" | "accepted" | "declined" | "cancelled" | "completed";
export type BookingKind = "viewing" | "shortstay" | "service";

export interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  estate: string;
  county: string;
  kind: BookingKind;
  status: BookingStatus;
  // Viewings: single date+time. Short stays: range + guests + nightly total
  date: string; // ISO date for viewings; check-in for stays
  time?: string;
  checkOut?: string; // stays only
  nights?: number;
  guests?: number;
  nightlyPrice?: number; // KES
  totalPrice?: number; // KES (nights × nightly + cleaning)
  cleaningFee?: number;
  note?: string;
  landlordName: string;
  landlordPhone?: string;
  responseTime?: string;
  paid?: boolean;
  paidAmount?: number;
  paidAt?: number;
  /** Id of the real request on the server, when it was sent to a live listing. */
  remoteId?: string;
  /** Why the request closed on its own: expired, taken, dates_taken, slot_full, unavailable. */
  closeReason?: string;
  createdAt: number;
  updatedAt: number;
}

const read = (): Booking[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

// Alert templates per booking status transition
const alertForStatus = (b: Booking): { title: string; body: string; type: "booking" } | null => {
  const label = b.propertyTitle;
  switch (b.status) {
    case "pending":
      return { type: "booking", title: "Booking requested", body: `Your request for ${label} was sent to the host.` };
    case "accepted":
      return b.kind === "shortstay"
        ? { type: "booking", title: "Short stay confirmed", body: `${label} is booked. Check-in details are ready.` }
        : { type: "booking", title: "Viewing confirmed", body: `Your viewing for ${label} was accepted by the host.` };
    case "declined":
      return b.closeReason
        ? { type: "booking", title: closeReasonLabel(b.closeReason) ?? "Request closed", body: `Your request for ${label} closed. Try another listing or provider.` }
        : { type: "booking", title: "Request declined", body: `The host declined your request for ${label}.` };
    case "cancelled":
      return { type: "booking", title: "Booking cancelled", body: `${label} booking was cancelled.` };
    case "completed":
      return b.kind === "shortstay"
        ? { type: "booking", title: "Stay completed", body: `Hope you enjoyed ${label}. Tap to leave a review.` }
        : { type: "booking", title: "Move-in complete", body: `Welcome home! ${label} is marked as moved-in.` };
    default:
      return null;
  }
};

const write = (list: Booking[], prev?: Booking[]) => {
  const prevList = prev ?? read();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));

  try {
    const prevMap = new Map(prevList.map((b) => [b.id, b.status]));
    list.forEach((b) => {
      const before = prevMap.get(b.id);
      if (before !== b.status) {
        const alert = alertForStatus(b);
        if (alert) pushGlobalAlert({ ...alert, action: "open-dashboard" });
      }
    });
  } catch {}
};

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>(read);

  useEffect(() => {
    const sync = () => setBookings(read());
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const addBooking = useCallback((b: Omit<Booking, "id" | "createdAt" | "updatedAt" | "status"> & { status?: BookingStatus }) => {
    const now = Date.now();
    const booking: Booking = {
      ...b,
      id: `bk_${now}_${Math.random().toString(36).slice(2, 7)}`,
      status: b.status ?? "pending",
      createdAt: now,
      updatedAt: now,
    };
    write([booking, ...read()]);
    return booking;
  }, []);

  const updateBooking = useCallback((id: string, patch: Partial<Booking>) => {
    write(read().map((b) => (b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b)));
  }, []);

  const cancelBooking = useCallback((id: string) => {
    const target = read().find((b) => b.id === id);
    write(read().map((b) => (b.id === id ? { ...b, status: "cancelled" as BookingStatus, updatedAt: Date.now() } : b)));
    // Cancel the real request too, so the provider's slot and your pending count free up.
    if (target?.remoteId) supabase.from("bookings").update({ status: "cancelled" }).eq("id", target.remoteId).then(() => {});
    toast("Booking cancelled");
  }, []);

  const removeBooking = useCallback((id: string) => {
    write(read().filter((b) => b.id !== id));
  }, []);

  const counts = {
    pending: bookings.filter((b) => b.status === "pending").length,
    accepted: bookings.filter((b) => b.status === "accepted").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    all: bookings.length,
  };

  return { bookings, counts, addBooking, updateBooking, cancelBooking, removeBooking };
};

// Imperative helpers (for non-hook contexts like timer callbacks)
export const _bookingsApi = {
  read,
  patch: (id: string, patch: Partial<Booking>) => {
    write(read().map((b) => (b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b)));
  },
};

/** Pulls the real status (and close reason) of every request that was sent to a live listing. */
export async function syncRemoteBookings() {
  const local = read();
  const ids = local.map((b) => b.remoteId).filter(Boolean) as string[];
  if (!ids.length) return;
  await expireStaleRequests();
  const { data } = await supabase.from("bookings").select("id, status, close_reason").in("id", ids);
  if (!data?.length) return;
  const byId = new Map(data.map((r: any) => [r.id, r]));
  let changed = false;
  const next = local.map((b) => {
    const r: any = b.remoteId ? byId.get(b.remoteId) : null;
    if (!r) return b;
    const status: BookingStatus = r.status === "requested" ? "pending" : r.status;
    if (status === b.status && (r.close_reason ?? undefined) === b.closeReason) return b;
    changed = true;
    return { ...b, status, closeReason: r.close_reason ?? undefined, updatedAt: Date.now() };
  });
  if (changed) write(next, local);
}

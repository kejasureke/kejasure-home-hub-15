import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "kejasure_bookings";
const EVENT = "bookings-updated";

export type BookingStatus = "pending" | "accepted" | "declined" | "cancelled" | "completed";
export type BookingKind = "viewing" | "shortstay";

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

const write = (list: Booking[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
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
    write(read().map((b) => (b.id === id ? { ...b, status: "cancelled" as BookingStatus, updatedAt: Date.now() } : b)));
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

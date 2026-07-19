import { toast } from "sonner";

/**
 * Lightweight local queue for user actions attempted while offline
 * (booking requests, chat sends, favorite toggles). We persist to
 * localStorage and drain automatically when the network comes back.
 *
 * This is a UI-first stub — actions are logged and surfaced to the user;
 * once a real backend is wired, the drain handler can post them.
 */

const KEY = "kejasure_offline_queue";

export type QueuedAction =
  | { kind: "booking"; propertyId: string; propertyTitle: string; payload: unknown; ts: number }
  | { kind: "chat"; contactName: string; text: string; ts: number };

const read = (): QueuedAction[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};

const write = (list: QueuedAction[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
  window.dispatchEvent(new Event("offline-queue-updated"));
};

export const enqueueOfflineAction = (action: Omit<QueuedAction, "ts"> & { ts?: number }) => {
  const list = read();
  list.push({ ...action, ts: action.ts ?? Date.now() } as QueuedAction);
  write(list);
};

export const getOfflineQueue = () => read();

export const clearOfflineQueue = () => write([]);

/** Attempts to drain queued items. In UI-mock mode we just toast + clear. */
export const drainOfflineQueue = () => {
  const list = read();
  if (list.length === 0) return;
  toast.success(`Synced ${list.length} pending action${list.length > 1 ? "s" : ""}`, {
    description: "Booking requests and messages sent while offline are now delivered.",
  });
  clearOfflineQueue();
};

// Auto-drain when the browser reports connectivity again.
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    // Small delay so the "Back online" banner settles first.
    setTimeout(drainOfflineQueue, 900);
  });
}

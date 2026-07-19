import { useCallback, useEffect, useState } from "react";

const MAX_RECENT = 10;
const STORAGE_KEY = "kejasure_recently_viewed_v2";
const LEGACY_KEY = "kejasure_recently_viewed";

export interface RecentEntry {
  id: string;
  ts: number;
}

const readRecent = (): RecentEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // Migrate legacy string[] → RecentEntry[]
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]") as string[];
    return legacy.map((id, i) => ({ id, ts: Date.now() - i * 60_000 }));
  } catch {
    return [];
  }
};

export const useRecentlyViewed = () => {
  const [recent, setRecent] = useState<RecentEntry[]>(readRecent);

  useEffect(() => {
    const sync = () => setRecent(readRecent());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const addRecent = useCallback((id: string) => {
    setRecent((prev) => {
      const next: RecentEntry[] = [
        { id, ts: Date.now() },
        ...prev.filter((x) => x.id !== id),
      ].slice(0, MAX_RECENT);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const recentIds = recent.map((r) => r.id);
  const recentMap = new Map(recent.map((r) => [r.id, r.ts] as const));

  return { recentIds, recent, recentMap, addRecent };
};

export const formatRelativeTime = (ts: number): string => {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
};

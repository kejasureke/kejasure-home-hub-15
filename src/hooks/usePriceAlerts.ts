import { useState, useEffect, useCallback } from "react";

export interface PriceAlert {
  id: string;
  propertyId: string;
  propertyTitle: string;
  estate: string;
  county: string;
  oldPrice: number;
  newPrice: number;
  priceUnit: string;
  dropPercent: number;
  timestamp: string;
  seen: boolean;
}

const STORAGE_KEY = "kejasure_price_alerts";
const TRACKED_KEY = "kejasure_tracked_prices";

interface TrackedPrice {
  propertyId: string;
  price: number;
  timestamp: string;
}

export function usePriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch { return []; }
  });

  const [trackedPrices, setTrackedPrices] = useState<TrackedPrice[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(TRACKED_KEY) || "[]");
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(TRACKED_KEY, JSON.stringify(trackedPrices));
  }, [trackedPrices]);

  const trackPrice = useCallback((propertyId: string, price: number) => {
    setTrackedPrices(prev => {
      const existing = prev.find(t => t.propertyId === propertyId);
      if (existing) return prev;
      return [...prev, { propertyId, price, timestamp: new Date().toISOString() }];
    });
  }, []);

  const isTracking = useCallback((propertyId: string) => {
    return trackedPrices.some(t => t.propertyId === propertyId);
  }, [trackedPrices]);

  const untrackPrice = useCallback((propertyId: string) => {
    setTrackedPrices(prev => prev.filter(t => t.propertyId !== propertyId));
  }, []);

  const addAlert = useCallback((alert: Omit<PriceAlert, "id" | "timestamp" | "seen">) => {
    setAlerts(prev => [{
      ...alert,
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      seen: false,
    }, ...prev]);
  }, []);

  const markSeen = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, seen: true } : a));
  }, []);

  const markAllSeen = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, seen: true })));
  }, []);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  const unseenCount = alerts.filter(a => !a.seen).length;

  return { alerts, unseenCount, trackPrice, untrackPrice, isTracking, addAlert, markSeen, markAllSeen, clearAlerts };
}

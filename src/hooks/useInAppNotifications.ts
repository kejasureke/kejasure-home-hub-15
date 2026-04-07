import { useState, useEffect, useCallback, useRef } from "react";

export interface InAppAlert {
  id: string;
  type: "message" | "booking" | "listing" | "price" | "verified" | "system";
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

const ALERT_SOUND_URL = "data:audio/wav;base64,UklGRl9vT19teleVBmb3JtYXQAAQABACDdAABAdQAAAgAQAGRhdGEDb...";

// Simple beep using Web Audio API
function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

const SIMULATED_ALERTS: Omit<InAppAlert, "id" | "timestamp" | "read">[] = [
  { type: "message", title: "New message from Jane Wanjiku", body: "Hi! Is the 2BR in Kilimani still available?" },
  { type: "booking", title: "Viewing confirmed", body: "Your viewing for Modern 3BR is set for tomorrow 10 AM." },
  { type: "listing", title: "New listing matches your search", body: "Furnished studio in Westlands at KES 35,000/mo just listed." },
  { type: "price", title: "Price drop alert", body: "3BR in Lavington dropped from KES 95K to KES 80K/mo." },
  { type: "verified", title: "Landlord verified", body: "The landlord for Cozy Studio has been ID-verified." },
  { type: "system", title: "Payment received", body: "KES 45,000 rent payment confirmed via M-Pesa." },
];

export const useInAppNotifications = () => {
  const [alerts, setAlerts] = useState<InAppAlert[]>([]);
  const [toast, setToast] = useState<InAppAlert | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  // Simulate receiving notifications periodically
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 15000 + Math.random() * 30000; // 15-45s
      timerRef.current = setTimeout(() => {
        const template = SIMULATED_ALERTS[indexRef.current % SIMULATED_ALERTS.length];
        indexRef.current++;
        const newAlert: InAppAlert = {
          ...template,
          id: `alert_${Date.now()}`,
          timestamp: Date.now(),
          read: false,
        };
        setAlerts((prev) => [newAlert, ...prev]);
        setToast(newAlert);
        if (soundEnabled) playAlertSound();
        // Auto-dismiss toast after 4s
        setTimeout(() => setToast(null), 4000);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [soundEnabled]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAlertRead = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const toggleSound = useCallback(() => setSoundEnabled((p) => !p), []);

  const pushAlert = useCallback((template: Omit<InAppAlert, "id" | "timestamp" | "read">) => {
    const newAlert: InAppAlert = {
      ...template,
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      read: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setToast(newAlert);
    if (soundEnabled) playAlertSound();
    setTimeout(() => setToast(null), 4000);
  }, [soundEnabled]);

  return {
    alerts,
    toast,
    unreadCount,
    soundEnabled,
    markAlertRead,
    markAllAlertsRead,
    dismissToast,
    toggleSound,
    pushAlert,
  };
};

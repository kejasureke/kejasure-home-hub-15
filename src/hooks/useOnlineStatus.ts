import { useEffect, useState } from "react";

/**
 * Reports real connectivity. Some Android webviews fire a spurious "offline"
 * event when the app is minimized/backgrounded even though the network is
 * fine — so before declaring offline we verify with an actual request.
 */
export const useOnlineStatus = () => {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      // Quick real connectivity probe — a 1px favicon with cache-busting.
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        await fetch(`/favicon.ico?probe=${Date.now()}`, {
          method: "HEAD",
          cache: "no-store",
          signal: ctrl.signal,
        });
        clearTimeout(t);
        if (!cancelled) setOnline(true);
      } catch {
        if (!cancelled) setOnline(false);
      }
    };

    const goOnline = () => setOnline(true);
    const maybeOffline = () => {
      // Don't trust the event alone — confirm with a real request.
      verify();
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", maybeOffline);
    return () => {
      cancelled = true;
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", maybeOffline);
    };
  }, []);

  return online;
};

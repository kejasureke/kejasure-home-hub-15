// Single guarded registration point for the app service worker.
// Never registers in dev, Lovable previews, iframes, or with ?sw=off —
// and unregisters any stale /sw.js registration in those contexts.

const SW_URL = "/sw.js";

const isRefusedContext = (): boolean => {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  if (window.self !== window.top) return true; // inside an iframe
  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
};

const unregisterStale = async (): Promise<void> => {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => r.active?.scriptURL.endsWith(SW_URL) || r.waiting?.scriptURL.endsWith(SW_URL) || r.installing?.scriptURL.endsWith(SW_URL))
        .map((r) => r.unregister()),
    );
  } catch {
    // best effort
  }
};

export const registerAppServiceWorker = (): void => {
  if (!("serviceWorker" in navigator)) return;
  if (isRefusedContext()) {
    void unregisterStale();
    return;
  }
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(SW_URL).catch(() => {
      // registration failure is non-fatal
    });
  });
};

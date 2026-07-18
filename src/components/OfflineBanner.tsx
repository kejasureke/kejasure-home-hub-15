import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * Global connectivity banner. Slides in from the top when the device goes
 * offline and shows a brief "Back online" confirmation when it recovers.
 * Sits above every overlay (z-[100]) and respects the status bar safe area.
 */
const OfflineBanner = () => {
  const online = useOnlineStatus();
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!online) {
      setWasOffline(true);
      setShowBackOnline(false);
      return;
    }
    if (wasOffline) {
      setShowBackOnline(true);
      const t = setTimeout(() => {
        setShowBackOnline(false);
        setWasOffline(false);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [online, wasOffline]);

  if (online && !showBackOnline) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[100] pointer-events-none flex justify-center"
      style={{ top: "var(--safe-area-top, env(safe-area-inset-top, 0px))" }}
    >
      <div
        className={`mt-2 px-3.5 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-semibold animate-fade-in ${
          online
            ? "bg-trust text-primary-foreground"
            : "bg-destructive text-destructive-foreground"
        }`}
      >
        {online ? (
          <>
            <Wifi className="w-3.5 h-3.5" /> Back online
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" /> You're offline · showing cached data
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineBanner;

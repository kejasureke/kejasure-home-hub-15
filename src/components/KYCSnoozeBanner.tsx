import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { useKYCStatus } from "@/hooks/useKYCStatus";

type KYCRole = "landlord" | "agency" | "stayhost";

interface KYCSnoozeBannerProps {
  role: KYCRole;
}

const KYCSnoozeBanner = ({ role }: KYCSnoozeBannerProps) => {
  const remindKey = `kejasure_kyc_banner_remind_${role}`;
  const { isVerified } = useKYCStatus(role);

  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      try {
        const remindAt = localStorage.getItem(remindKey);
        if (!remindAt) { setTimeLeft(null); return; }
        const diff = Number(remindAt) - Date.now();
        if (diff <= 0) {
          localStorage.removeItem(remindKey);
          setTimeLeft(null);
          return;
        }
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);
      } catch {
        setTimeLeft(null);
      }
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [remindKey]);

  if (isVerified || !timeLeft) return null;

  const cancelSnooze = () => {
    localStorage.removeItem(remindKey);
    setTimeLeft(null);
    window.dispatchEvent(new CustomEvent("kyc-snooze-cancelled", { detail: { role } }));
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/50 border border-border mb-3">
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground">
          Reminder snoozed · returns in <span className="font-semibold text-foreground">{timeLeft}</span>
        </p>
      </div>
      <button
        onClick={cancelSnooze}
        className="text-xs font-medium text-primary hover:underline shrink-0 ml-2"
      >
        Verify now
      </button>
    </div>
  );
};

export default KYCSnoozeBanner;

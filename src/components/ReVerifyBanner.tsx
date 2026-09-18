import { useState } from "react";
import { ScanFace, X } from "lucide-react";
import { getTrustState, isRecheckDue, daysSinceCheck } from "@/lib/trust";
import { haptic } from "@/lib/despia";

interface ReVerifyBannerProps {
  role: string;
  onVerify: () => void;
}

const snoozeKey = (role: string) => `kejasure_recheck_snooze_${role}`;

const ReVerifyBanner = ({ role, onVerify }: ReVerifyBannerProps) => {
  const [dismissed, setDismissed] = useState(() => {
    try {
      const until = Number(localStorage.getItem(snoozeKey(role)) || 0);
      return Date.now() < until;
    } catch {
      return false;
    }
  });

  const state = getTrustState(role);
  if (dismissed || !isRecheckDue(state, role)) return null;

  const days = daysSinceCheck(state.lastCheck);

  const snooze = () => {
    haptic("light");
    try {
      localStorage.setItem(snoozeKey(role), String(Date.now() + 7 * 86_400_000));
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <div className="mb-4 p-3.5 rounded-2xl border border-amber-500/25 bg-amber-500/10 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
          <ScanFace className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Time for a quick selfie check</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {days === null
              ? "We refresh selfie checks every 6 months to keep the community safe."
              : `Your last check was ${days} days ago. A fresh selfie keeps your verified badge active.`}
          </p>
          <button
            onClick={() => { haptic("light"); onVerify(); }}
            className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-500 text-[11px] font-bold text-white active:scale-95 transition-transform"
          >
            Take selfie
          </button>
        </div>
        <button onClick={snooze} className="p-1 text-muted-foreground shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ReVerifyBanner;

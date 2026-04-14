import { useState, useEffect } from "react";
import { ShieldCheck, ChevronRight, X, FileText, Building2, AlertTriangle, Clock } from "lucide-react";
import KYCVerificationFlow from "./KYCVerificationFlow";
import { useKYCStatus } from "@/hooks/useKYCStatus";

type KYCRole = "landlord" | "agency" | "stayhost";

interface KYCPromptBannerProps {
  role: KYCRole;
}

const roleConfig: Record<KYCRole, { title: string; subtitle: string; badge: string; docs: string[]; icon: typeof ShieldCheck }> = {
  landlord: {
    title: "Complete your verification",
    subtitle: "Verify your identity to unlock all landlord features and earn a trust badge",
    badge: "Landlord Verified",
    docs: ["National ID", "KRA PIN", "Ownership proof"],
    icon: ShieldCheck,
  },
  agency: {
    title: "Verify your agency",
    subtitle: "Upload business documents to get your Business Verified badge",
    badge: "Business Verified",
    docs: ["Business Certificate", "KRA PIN", "CR12 Form"],
    icon: Building2,
  },
  stayhost: {
    title: "Get verified as a host",
    subtitle: "Complete ID verification to earn a trust badge and accept bookings faster",
    badge: "Host Verified",
    docs: ["National ID", "Property photos"],
    icon: ShieldCheck,
  },
};

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const KYCPromptBanner = ({ role }: KYCPromptBannerProps) => {
  const dismissKey = `kejasure_kyc_banner_dismissed_${role}`;
  const remindKey = `kejasure_kyc_banner_remind_${role}`;

  const [dismissed, setDismissed] = useState(() => {
    try {
      // Check remind-later timestamp first
      const remindAt = localStorage.getItem(remindKey);
      if (remindAt && Date.now() < Number(remindAt)) return true;
      if (remindAt && Date.now() >= Number(remindAt)) localStorage.removeItem(remindKey);
      return localStorage.getItem(dismissKey) === "true";
    } catch { return false; }
  });
  const [showKYC, setShowKYC] = useState(false);
  const { isVerified, markVerified } = useKYCStatus(role);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.role === role) setDismissed(false);
    };
    window.addEventListener("kyc-snooze-cancelled", handler);
    return () => window.removeEventListener("kyc-snooze-cancelled", handler);
  }, [role]);

  if (dismissed || isVerified) return null;

  const config = roleConfig[role];
  const Icon = config.icon;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(dismissKey, "true");
  };

  const handleRemindLater = () => {
    setDismissed(true);
    localStorage.setItem(remindKey, String(Date.now() + TWENTY_FOUR_HOURS));
    localStorage.removeItem(`kejasure_kyc_snooze_notified_${role}`);
  };

  return (
    <>
      {showKYC && (
        <KYCVerificationFlow
          onClose={(completed?: boolean) => {
            setShowKYC(false);
            if (completed) {
              markVerified();
              localStorage.removeItem(dismissKey);
              localStorage.removeItem(remindKey);
            }
          }}
          activeRole={role === "agency" ? "agency" : role === "stayhost" ? "stayhost" : "landlord"}
        />
      )}
      <div className="relative p-4 rounded-2xl border-2 border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-700/30 mb-4">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-secondary flex items-center justify-center"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-sm font-bold text-foreground">{config.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{config.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {config.docs.map((doc) => (
            <span key={doc} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-[10px] font-medium text-muted-foreground">
              <FileText className="w-3 h-3" />
              {doc}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRemindLater}
            className="flex-1 py-3 rounded-xl bg-secondary text-muted-foreground text-sm font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
          >
            <Clock className="w-4 h-4" />
            Remind Later
          </button>
          <button
            onClick={() => setShowKYC(true)}
            className="flex-[2] py-3 rounded-xl gradient-trust text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Icon className="w-4 h-4" />
            Start Verification
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default KYCPromptBanner;

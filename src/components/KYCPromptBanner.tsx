import { useState } from "react";
import { ShieldCheck, ChevronRight, X, FileText, Building2, AlertTriangle } from "lucide-react";
import KYCVerificationFlow from "./KYCVerificationFlow";

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

const KYCPromptBanner = ({ role }: KYCPromptBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [showKYC, setShowKYC] = useState(false);

  if (dismissed) return null;

  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <>
      {showKYC && (
        <KYCVerificationFlow
          onClose={() => setShowKYC(false)}
          activeRole={role === "agency" ? "agency" : role === "stayhost" ? "stayhost" : "landlord"}
        />
      )}
      <div className="relative p-4 rounded-2xl border-2 border-amber-300/50 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-700/30 mb-4">
        <button
          onClick={() => setDismissed(true)}
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

        <button
          onClick={() => setShowKYC(true)}
          className="w-full py-3 rounded-xl gradient-trust text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Icon className="w-4 h-4" />
          Start Verification
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

export default KYCPromptBanner;

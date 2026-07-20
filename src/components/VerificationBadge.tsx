import { ShieldCheck, ShieldAlert, X, CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { haptic } from "@/lib/despia";

interface VerificationBadgeProps {
  isVerified: boolean;
  variant?: "light" | "dark";
  /** Verification detail flags for the popover breakdown. */
  details?: {
    phone?: boolean;
    id?: boolean;
    ownership?: boolean;
    business?: boolean;
  };
}

const VerificationBadge = ({ isVerified, variant = "light", details }: VerificationBadgeProps) => {
  const [open, setOpen] = useState(false);

  const rows = isVerified
    ? [
        { label: "Phone number verified", ok: details?.phone ?? true },
        { label: "Government ID verified", ok: details?.id ?? true },
        { label: "Ownership document", ok: details?.ownership ?? true },
        ...(details?.business !== undefined ? [{ label: "Business registration", ok: details.business }] : []),
      ]
    : [
        { label: "Phone number verified", ok: details?.phone ?? false },
        { label: "Government ID verified", ok: false },
        { label: "Ownership document", ok: false },
      ];

  const onTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic("light");
    setOpen(true);
  };

  return (
    <>
      {isVerified ? (
        <button
          onClick={onTap}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-trust/20 text-[10px] font-bold text-trust active:scale-95 transition-transform"
        >
          <ShieldCheck className="w-3 h-3" />
          Verified
        </button>
      ) : (
        <button
          onClick={onTap}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold active:scale-95 transition-transform ${
            variant === "light"
              ? "bg-amber-500/20 text-amber-200"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
          }`}
        >
          <ShieldAlert className="w-3 h-3" />
          Unverified
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-end bg-foreground/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-card rounded-t-3xl safe-bottom pb-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <div className="px-5 pt-3 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isVerified ? "bg-trust/15 text-trust" : "bg-amber-500/15 text-amber-500"}`}>
                  {isVerified ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{isVerified ? "Verified by KejaSure" : "Not yet verified"}</p>
                  <p className="text-[11px] text-muted-foreground">What we checked</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 pt-2 space-y-2.5">
              {rows.map((r) => (
                <div key={r.label} className="flex items-center gap-2.5">
                  {r.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-trust shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={`text-xs ${r.ok ? "text-foreground font-medium" : "text-muted-foreground"}`}>{r.label}</span>
                </div>
              ))}
            </div>
            <div className="mx-5 mt-4 p-3 rounded-xl bg-secondary/60">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {isVerified
                  ? "This user or listing has passed our verification checks. Always confirm details in person before making commitments."
                  : "This listing hasn't been verified yet. Exercise extra caution — never send money before viewing."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VerificationBadge;

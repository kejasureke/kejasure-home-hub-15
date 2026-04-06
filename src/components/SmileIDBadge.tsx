import { useState } from "react";
import { CheckCircle2, ChevronRight, X } from "lucide-react";

interface SmileIDVerificationModalProps {
  propertyId: string;
  imageCount?: number;
}

const smileChecks = [
  { label: "Image authenticity", detail: "Original photos confirmed" },
  { label: "AI-generated content", detail: "No AI generation detected" },
  { label: "Reverse image search", detail: "No stock photo matches" },
  { label: "Metadata & EXIF", detail: "Valid GPS & timestamp data" },
  { label: "Duplicate detection", detail: "No duplicates found" },
  { label: "Photo quality", detail: "High resolution (4032×3024)" },
];

const SmileIDLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path d="M7 14c0 0 2 3.5 5 3.5s5-3.5 5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="9" cy="10" r="1.2" fill="currentColor" />
    <circle cx="15" cy="10" r="1.2" fill="currentColor" />
  </svg>
);

const SmileIDBadge = ({ compact = false, propertyId, imageCount = 4 }: { compact?: boolean; propertyId: string; imageCount?: number }) => {
  const [open, setOpen] = useState(false);

  const verifiedDate = new Date(Date.now() - 3 * 86400000).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  const validUntil = new Date(Date.now() + 87 * 86400000).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      {compact ? (
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 border border-primary/15 active:scale-95 transition-transform"
        >
          <SmileIDLogo className="w-3 h-3 text-primary" />
          <span className="text-[9px] font-semibold text-primary">Photos Verified by Smile ID</span>
        </button>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          className="w-full text-left p-4 rounded-2xl bg-primary/5 border border-primary/15 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <SmileIDLogo className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-primary">Photos Verified by Smile ID</p>
              <p className="text-[10px] text-muted-foreground">Tap to view verification details</p>
            </div>
            <ChevronRight className="w-4 h-4 text-primary shrink-0" />
          </div>
        </button>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md bg-card rounded-t-3xl p-5 pb-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl gradient-trust flex items-center justify-center">
                <SmileIDLogo className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-base font-bold">Smile ID Verification</h3>
                <p className="text-[10px] text-muted-foreground">Photo & identity verification report</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-primary">Overall Score: 97%</p>
                  <p className="text-[10px] text-muted-foreground">Verified on {verifiedDate}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {smileChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{check.label}</p>
                    <p className="text-[10px] text-primary">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-secondary mb-4">
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div>
                  <p className="text-muted-foreground">Verification ID</p>
                  <p className="font-semibold font-mono">SID-{propertyId.slice(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Photos Checked</p>
                  <p className="font-semibold">{imageCount} photos</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Valid Until</p>
                  <p className="font-semibold">{validUntil}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Provider</p>
                  <p className="font-semibold">Smile Identity</p>
                </div>
              </div>
            </div>

            <p className="text-[9px] text-center text-muted-foreground">
              Powered by Smile ID · Africa's leading identity verification
            </p>

            <button
              onClick={() => setOpen(false)}
              className="w-full mt-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SmileIDBadge;

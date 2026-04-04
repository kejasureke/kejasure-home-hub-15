import { useState } from "react";
import {
  AlertTriangle, Flag, ShieldAlert, Camera, Send, CheckCircle2, X,
  ImageOff, MapPinOff, DollarSign, UserX, FileWarning
} from "lucide-react";

interface ReportListingModalProps {
  listingTitle: string;
  listingId: string;
  onClose: () => void;
}

const reportReasons = [
  { id: "fake", icon: ImageOff, label: "Fake listing / photos", desc: "Photos don't match the actual property" },
  { id: "scam", icon: ShieldAlert, label: "Scam / fraud attempt", desc: "Asking for payment outside the app" },
  { id: "wrong-location", icon: MapPinOff, label: "Wrong location", desc: "Location or address is incorrect" },
  { id: "wrong-price", icon: DollarSign, label: "Misleading price", desc: "Price is different from advertised" },
  { id: "impersonation", icon: UserX, label: "Impersonation", desc: "Pretending to be someone else" },
  { id: "other", icon: FileWarning, label: "Other violation", desc: "Something else is wrong" },
];

type ReportStep = "reason" | "details" | "submitted";

const ReportListingModal = ({ listingTitle, listingId, onClose }: ReportListingModalProps) => {
  const [step, setStep] = useState<ReportStep>("reason");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [hasScreenshot, setHasScreenshot] = useState(false);

  const handleSubmit = () => {
    setStep("submitted");
  };

  // Submitted confirmation
  if (step === "submitted") {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={onClose}>
        <div className="w-[90%] max-w-sm bg-card rounded-3xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Report Submitted</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Thank you for helping keep KejaSure safe. Our team will review this report within 24 hours.
            </p>
            <div className="w-full bg-secondary/50 rounded-xl p-3 mb-4 text-left">
              <p className="text-[10px] text-muted-foreground mb-1">Report ID</p>
              <p className="text-xs font-bold text-foreground">RPT-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
              <p className="text-[10px] text-muted-foreground mt-2">Listing</p>
              <p className="text-xs font-semibold text-foreground">{listingTitle}</p>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-trust/5 border border-trust/15 w-full mb-4">
              <ShieldAlert className="w-4 h-4 text-trust shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                If this listing is confirmed fraudulent, it will be <span className="font-semibold text-trust">removed immediately</span> and the poster warned.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full bg-card rounded-t-3xl p-5 pb-6 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Flag className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Report Listing</h3>
            <p className="text-[11px] text-muted-foreground truncate max-w-[250px]">{listingTitle}</p>
          </div>
        </div>

        {step === "reason" && (
          <>
            <p className="text-xs text-muted-foreground mb-3">What's wrong with this listing?</p>
            <div className="space-y-2 mb-4">
              {reportReasons.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-[0.98] text-left ${
                    selectedReason === r.id
                      ? "border-destructive bg-destructive/5"
                      : "border-border bg-card"
                  }`}
                >
                  <r.icon className={`w-5 h-5 shrink-0 ${selectedReason === r.id ? "text-destructive" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-semibold">{r.label}</p>
                    <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => selectedReason && setStep("details")}
              disabled={!selectedReason}
              className="w-full py-3.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              Continue
            </button>
          </>
        )}

        {step === "details" && (
          <>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/5 border border-destructive/15 mb-4">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Reason: <span className="font-semibold text-foreground">{reportReasons.find(r => r.id === selectedReason)?.label}</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Additional details (optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what's wrong with this listing..."
                className="w-full h-24 p-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-destructive/20 resize-none"
                maxLength={500}
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{details.length}/500</p>
            </div>

            {/* Screenshot toggle */}
            <button
              onClick={() => setHasScreenshot(!hasScreenshot)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 mb-4 transition-all ${
                hasScreenshot ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <Camera className={`w-5 h-5 ${hasScreenshot ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-left">
                <p className="text-xs font-semibold">{hasScreenshot ? "Screenshot attached" : "Attach screenshot"}</p>
                <p className="text-[10px] text-muted-foreground">Helps our team investigate faster</p>
              </div>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setStep("reason")}
                className="flex-1 py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Submit Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportListingModal;
import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Shield, Eye, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type VerificationMode = "listing" | "identity";
type VerificationStatus = "idle" | "scanning" | "complete";

interface VerificationCheck {
  label: string;
  status: "pending" | "checking" | "pass" | "warn" | "fail";
  detail?: string;
}

interface AIPhotoVerificationProps {
  mode: VerificationMode;
  onComplete?: (passed: boolean, score: number) => void;
  simulateMatch?: boolean;
}

const listingChecks: Omit<VerificationCheck, "status">[] = [
  { label: "Image authenticity scan" },
  { label: "AI-generated content detection" },
  { label: "Reverse image search" },
  { label: "Metadata & geolocation check" },
  { label: "Duplicate listing detection" },
  { label: "Photo quality assessment" },
];

const identityChecks: Omit<VerificationCheck, "status">[] = [
  { label: "Face detection & alignment" },
  { label: "Liveness detection" },
  { label: "Selfie ↔ ID face match" },
  { label: "Document OCR & validation" },
  { label: "Anti-spoofing analysis" },
  { label: "Biometric enrollment" },
];

const SmileIDLogo = () => (
  <svg viewBox="0 0 120 28" className="h-4" fill="none">
    <circle cx="14" cy="14" r="13" fill="hsl(var(--primary))" />
    <path d="M8 16c0 0 2.5 4 6 4s6-4 6-4" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" />
    <circle cx="10" cy="11" r="1.5" fill="hsl(var(--primary-foreground))" />
    <circle cx="18" cy="11" r="1.5" fill="hsl(var(--primary-foreground))" />
    <text x="32" y="19" fill="currentColor" fontSize="14" fontWeight="700" fontFamily="system-ui">smile.id</text>
  </svg>
);

const AIPhotoVerification = ({ mode, onComplete, simulateMatch = true }: AIPhotoVerificationProps) => {
  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [checks, setChecks] = useState<VerificationCheck[]>(
    (mode === "listing" ? listingChecks : identityChecks).map((c) => ({ ...c, status: "pending" }))
  );
  const [overallScore, setOverallScore] = useState(0);
  const [passed, setPassed] = useState(false);

  const startVerification = () => {
    setStatus("scanning");
    setProgress(0);
    const freshChecks = (mode === "listing" ? listingChecks : identityChecks).map((c) => ({ ...c, status: "pending" as const, detail: undefined }));
    setChecks(freshChecks);

    const totalChecks = freshChecks.length;
    const interval = 700;

    freshChecks.forEach((_, idx) => {
      setTimeout(() => {
        setChecks((prev) =>
          prev.map((c, i) => (i === idx ? { ...c, status: "checking" } : c))
        );
      }, idx * interval);

      setTimeout(() => {
        const rand = Math.random();
        let result: VerificationCheck["status"];
        let detail: string | undefined;

        if (mode === "identity" && idx === 2) {
          result = simulateMatch ? "pass" : "fail";
          detail = simulateMatch ? "98.7% match confidence" : "Face mismatch — retry with better lighting";
        } else if (rand > 0.15) {
          result = "pass";
          detail = getPassDetail(mode, idx);
        } else if (rand > 0.05) {
          result = "warn";
          detail = getWarnDetail(mode, idx);
        } else {
          result = "fail";
          detail = getFailDetail(mode, idx);
        }

        setChecks((prev) =>
          prev.map((c, i) => (i === idx ? { ...c, status: result, detail } : c))
        );
        setProgress(Math.round(((idx + 1) / totalChecks) * 100));
      }, idx * interval + 500);
    });

    setTimeout(() => {
      setStatus("complete");
      setChecks((prev) => {
        const passCount = prev.filter((c) => c.status === "pass").length;
        const warnCount = prev.filter((c) => c.status === "warn").length;
        const score = Math.round(((passCount + warnCount * 0.5) / totalChecks) * 100);
        setOverallScore(score);
        const didPass = score >= 70 && !prev.some((c) => c.status === "fail");
        setPassed(didPass);
        onComplete?.(didPass, score);
        return prev;
      });
    }, freshChecks.length * interval + 800);
  };

  const statusIcon = (s: VerificationCheck["status"]) => {
    switch (s) {
      case "pass": return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "warn": return <AlertTriangle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
      case "fail": return <XCircle className="w-4 h-4 text-destructive" />;
      case "checking": return <Eye className="w-4 h-4 text-primary animate-pulse" />;
      default: return <div className="w-4 h-4 rounded-full bg-muted" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* smile.id branded card */}
      <div className="p-4 rounded-2xl bg-card card-shadow border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl gradient-trust flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary-foreground" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M7 14c0 0 2 3.5 5 3.5s5-3.5 5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="9" cy="10" r="1.2" fill="currentColor" />
              <circle cx="15" cy="10" r="1.2" fill="currentColor" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <SmileIDLogo />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {mode === "listing"
                ? "Photo authenticity verification"
                : "Biometric identity verification"}
            </p>
          </div>
          {status === "idle" && (
            <button
              onClick={startVerification}
              className="px-4 py-2 rounded-xl gradient-trust text-xs font-bold text-primary-foreground active:scale-95 transition-transform"
            >
              {mode === "listing" ? "Verify Photos" : "Start KYC"}
            </button>
          )}
          {status === "complete" && (
            <button
              onClick={() => { setStatus("idle"); setProgress(0); }}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Progress */}
        {status === "scanning" && (
          <div className="space-y-1.5">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">Processing with smile.id...</p>
              <p className="text-[10px] font-semibold text-primary">{progress}%</p>
            </div>
          </div>
        )}

        {/* Result */}
        {status === "complete" && (
          <div className={`flex items-center gap-3 p-3 rounded-xl ${
            passed ? "bg-primary/10 border border-primary/20" : "bg-destructive/10 border border-destructive/20"
          }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              passed ? "bg-primary/20" : "bg-destructive/20"
            }`}>
              {passed ? (
                <Shield className="w-6 h-6 text-primary" />
              ) : (
                <XCircle className="w-6 h-6 text-destructive" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${passed ? "text-primary" : "text-destructive"}`}>
                {passed
                  ? mode === "listing" ? "Photos Verified ✓" : "Identity Verified ✓"
                  : mode === "listing" ? "Verification Failed" : "KYC Failed"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {passed
                  ? mode === "listing"
                    ? "All photos passed smile.id authenticity checks"
                    : "Biometric match confirmed by smile.id"
                  : mode === "listing"
                    ? "Some photos failed authenticity checks"
                    : "Identity could not be verified — please retry"}
              </p>
            </div>
            <div className={`text-xl font-black shrink-0 ${passed ? "text-primary" : "text-destructive"}`}>
              {overallScore}%
            </div>
          </div>
        )}
      </div>

      {/* Check details */}
      {status !== "idle" && (
        <div className="space-y-1.5">
          {checks.map((check, i) => (
            <div
              key={check.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                check.status === "checking"
                  ? "bg-primary/5 border border-primary/15"
                  : check.status === "pending"
                    ? "bg-secondary/50"
                    : "bg-card card-shadow"
              }`}
            >
              {statusIcon(check.status)}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${check.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                  {check.label}
                </p>
                {check.detail && (
                  <p className={`text-[10px] ${
                    check.status === "pass" ? "text-primary" : check.status === "warn" ? "text-yellow-500 dark:text-yellow-400" : "text-destructive"
                  }`}>
                    {check.detail}
                  </p>
                )}
              </div>
              {check.status === "checking" && (
                <div className="flex gap-0.5">
                  {[0, 1, 2].map((d) => (
                    <div key={d} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${d * 150}ms` }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* smile.id footer */}
      {status !== "idle" && (
        <p className="text-[9px] text-center text-muted-foreground">
          Powered by smile.id · Africa's leading identity verification
        </p>
      )}
    </div>
  );
};

function getPassDetail(mode: VerificationMode, idx: number): string {
  const listing = ["Original photo confirmed", "No AI generation signatures", "No matches in image databases", "Valid EXIF & GPS data present", "No duplicate listings found", "High resolution — meets standards"];
  const identity = ["Face detected & aligned", "Live person confirmed", "98.7% biometric match", "Document OCR validated", "No spoofing artifacts", "Biometric template stored"];
  return mode === "listing" ? listing[idx] : identity[idx];
}

function getWarnDetail(mode: VerificationMode, idx: number): string {
  const listing = ["Possible filter or enhancement", "Minor AI artifacts detected", "Similar image found (65% match)", "Partial metadata available", "Similar listing in this area", "Moderate quality — acceptable"];
  const identity = ["Face partially obscured", "Low confidence — retry recommended", "82% match — manual review needed", "Minor document wear detected", "Glare detected on document", "Low quality — re-enroll suggested"];
  return mode === "listing" ? listing[idx] : identity[idx];
}

function getFailDetail(mode: VerificationMode, idx: number): string {
  const listing = ["Suspected stock photo", "AI-generated image flagged", "Exact match found in stock DB", "No metadata — likely screenshot", "Duplicate listing confirmed", "Below minimum quality threshold"];
  const identity = ["No face detected in frame", "Liveness check failed", "Biometric mismatch", "Document appears altered", "Spoofing attempt detected", "Enrollment rejected"];
  return mode === "listing" ? listing[idx] : identity[idx];
}

export default AIPhotoVerification;

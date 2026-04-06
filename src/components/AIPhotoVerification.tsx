import { useState, useEffect } from "react";
import { Camera, CheckCircle2, XCircle, AlertTriangle, Shield, Sparkles, Eye, Fingerprint, RotateCcw } from "lucide-react";
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
  /** For identity mode: simulate whether selfie matches ID */
  simulateMatch?: boolean;
}

const listingChecks: Omit<VerificationCheck, "status">[] = [
  { label: "Original photo detection" },
  { label: "AI-generated image check" },
  { label: "Stock photo database scan" },
  { label: "Metadata & EXIF analysis" },
  { label: "Duplicate listing search" },
  { label: "Photo quality assessment" },
];

const identityChecks: Omit<VerificationCheck, "status">[] = [
  { label: "Face detection & quality" },
  { label: "Liveness check" },
  { label: "Selfie-to-ID face match" },
  { label: "Document authenticity scan" },
  { label: "Anti-spoofing analysis" },
  { label: "Deepfake detection" },
];

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
    setChecks((prev) => prev.map((c) => ({ ...c, status: "pending", detail: undefined })));

    const totalChecks = checks.length;
    const interval = 700;

    checks.forEach((_, idx) => {
      setTimeout(() => {
        setChecks((prev) =>
          prev.map((c, i) =>
            i === idx ? { ...c, status: "checking" } : c
          )
        );
      }, idx * interval);

      setTimeout(() => {
        const rand = Math.random();
        let result: VerificationCheck["status"];
        let detail: string | undefined;

        if (mode === "identity" && idx === 2) {
          // Selfie-to-ID match
          result = simulateMatch ? "pass" : "fail";
          detail = simulateMatch ? "98.7% match confidence" : "Face mismatch detected";
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
          prev.map((c, i) =>
            i === idx ? { ...c, status: result, detail } : c
          )
        );
        setProgress(Math.round(((idx + 1) / totalChecks) * 100));
      }, idx * interval + 500);
    });

    setTimeout(() => {
      setStatus("complete");
      // Calculate score
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
    }, checks.length * interval + 800);
  };

  const statusIcon = (s: VerificationCheck["status"]) => {
    switch (s) {
      case "pass": return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "warn": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "fail": return <XCircle className="w-4 h-4 text-destructive" />;
      case "checking": return <Eye className="w-4 h-4 text-primary animate-pulse" />;
      default: return <div className="w-4 h-4 rounded-full bg-muted" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-card card-shadow border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl gradient-trust flex items-center justify-center">
            {mode === "listing" ? (
              <Camera className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Fingerprint className="w-5 h-5 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              AI Photo Verification
            </h3>
            <p className="text-[10px] text-muted-foreground">
              {mode === "listing"
                ? "Verify listing photos are authentic & original"
                : "AI-powered selfie-to-ID matching"}
            </p>
          </div>
          {status === "idle" && (
            <button
              onClick={startVerification}
              className="px-4 py-2 rounded-xl gradient-trust text-xs font-bold text-primary-foreground active:scale-95 transition-transform"
            >
              Verify
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

        {/* Progress bar */}
        {status === "scanning" && (
          <div className="space-y-1.5">
            <Progress value={progress} className="h-2" />
            <p className="text-[10px] text-muted-foreground text-center">
              Analyzing... {progress}%
            </p>
          </div>
        )}

        {/* Score badge */}
        {status === "complete" && (
          <div className={`flex items-center gap-3 p-3 rounded-xl ${
            passed ? "bg-primary/10 border border-primary/20" : "bg-destructive/10 border border-destructive/20"
          }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              passed ? "bg-primary/20" : "bg-destructive/20"
            }`}>
              {passed ? (
                <Shield className="w-6 h-6 text-primary" />
              ) : (
                <XCircle className="w-6 h-6 text-destructive" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-bold ${passed ? "text-primary" : "text-destructive"}`}>
                {passed ? "Verification Passed" : "Verification Failed"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {passed
                  ? mode === "listing"
                    ? "Photos appear authentic and original"
                    : "Identity successfully matched"
                  : mode === "listing"
                    ? "Issues detected with photo authenticity"
                    : "Identity could not be verified"}
              </p>
            </div>
            <div className={`text-xl font-black ${passed ? "text-primary" : "text-destructive"}`}>
              {overallScore}%
            </div>
          </div>
        )}
      </div>

      {/* Checks list */}
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
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {statusIcon(check.status)}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${check.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                  {check.label}
                </p>
                {check.detail && (
                  <p className={`text-[10px] ${
                    check.status === "pass" ? "text-primary" : check.status === "warn" ? "text-amber-500" : "text-destructive"
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
    </div>
  );
};

// Helper functions for mock details
function getPassDetail(mode: VerificationMode, idx: number): string {
  const listing = ["Original photo confirmed", "No AI generation detected", "Not found in stock databases", "Valid EXIF data present", "No duplicates found", "High resolution (4032×3024)"];
  const identity = ["Clear face detected", "Live person confirmed", "98.7% match confidence", "Document appears authentic", "No spoofing detected", "No deepfake artifacts"];
  return mode === "listing" ? listing[idx] : identity[idx];
}

function getWarnDetail(mode: VerificationMode, idx: number): string {
  const listing = ["Possible filter applied", "Minor artifacts detected", "Similar image found (65%)", "Limited EXIF data", "Similar listing in area", "Moderate quality (1280×960)"];
  const identity = ["Face partially obscured", "Low confidence liveness", "82% match — review needed", "Minor wear on document", "Reflection detected", "Low-quality image"];
  return mode === "listing" ? listing[idx] : identity[idx];
}

function getFailDetail(mode: VerificationMode, idx: number): string {
  const listing = ["Suspected stock photo", "AI-generated image detected", "Exact match in stock DB", "No EXIF data — screenshot", "Duplicate listing detected", "Image too low quality"];
  const identity = ["No face detected", "Liveness check failed", "Face mismatch", "Document appears forged", "Spoofing detected", "Deepfake detected"];
  return mode === "listing" ? listing[idx] : identity[idx];
}

export default AIPhotoVerification;

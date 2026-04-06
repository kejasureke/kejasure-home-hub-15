import { useState } from "react";
import { ArrowLeft, ShieldCheck, Camera, Upload, FileText, CheckCircle2, Clock, AlertCircle, User, Building2, Fingerprint, X, ChevronRight } from "lucide-react";
import AIPhotoVerification from "./AIPhotoVerification";

interface KYCVerificationFlowProps {
  onClose: () => void;
  activeRole?: string;
}

type VerificationType = "individual" | "business";
type DocType = "national_id" | "passport" | "kra_pin";
type BusinessDocType = "business_cert" | "kra_pin" | "cr12";
type Step = "type_select" | "doc_select" | "id_upload" | "selfie" | "processing" | "result";
type VerificationResult = "success" | "failed" | "pending";

const KYCVerificationFlow = ({ onClose, activeRole = "tenant" }: KYCVerificationFlowProps) => {
  const [step, setStep] = useState<Step>("type_select");
  const [verificationType, setVerificationType] = useState<VerificationType | null>(null);
  const [docType, setDocType] = useState<DocType | BusinessDocType | null>(null);
  const [idFrontUploaded, setIdFrontUploaded] = useState(false);
  const [idBackUploaded, setIdBackUploaded] = useState(false);
  const [selfieCapture, setSelfieCapture] = useState<"none" | "capturing" | "done">("none");
  const [result, setResult] = useState<VerificationResult>("pending");

  const individualDocs = [
    { type: "national_id" as DocType, label: "National ID", desc: "Kenyan National ID card", icon: FileText },
    { type: "passport" as DocType, label: "Passport", desc: "Valid Kenyan passport", icon: FileText },
    { type: "kra_pin" as DocType, label: "KRA PIN Certificate", desc: "Tax compliance certificate", icon: FileText },
  ];

  const businessDocs = [
    { type: "business_cert" as BusinessDocType, label: "Business Certificate", desc: "Certificate of incorporation", icon: Building2 },
    { type: "kra_pin" as BusinessDocType, label: "KRA PIN (Business)", desc: "Business tax certificate", icon: FileText },
    { type: "cr12" as BusinessDocType, label: "CR12 Form", desc: "Company directors form", icon: FileText },
  ];

  const handleProcessing = () => {
    setStep("processing");
    setTimeout(() => {
      const outcome = Math.random() > 0.2 ? "success" : "failed";
      setResult(outcome);
      if (outcome === "success") {
        localStorage.setItem(`kejasure_kyc_status_${activeRole}`, "verified");
        // Keep legacy key for backward compat
        localStorage.setItem("kejasure_kyc_status", "verified");
      }
      setStep("result");
    }, 4000);
  };

  const progressSteps = ["Type", "Document", "Upload", "Selfie", "Verify"];
  const currentProgress = step === "type_select" ? 0 : step === "doc_select" ? 1 : step === "id_upload" ? 2 : step === "selfie" ? 3 : 4;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-surface border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold">Identity Verification</h1>
            <p className="text-[10px] text-muted-foreground">Powered by Smile ID</p>
          </div>
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        {/* Progress */}
        <div className="flex items-center gap-1 mt-3">
          {progressSteps.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1 w-full rounded-full transition-colors ${i <= currentProgress ? "bg-primary" : "bg-muted"}`} />
              <span className={`text-[9px] font-medium ${i <= currentProgress ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 pb-20">
        {/* Step 1: Type Selection */}
        {step === "type_select" && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl gradient-trust mx-auto flex items-center justify-center mb-3">
                <ShieldCheck className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold">Verify Your Identity</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose your verification type to get the trusted badge</p>
            </div>

            {[
              { type: "individual" as VerificationType, icon: User, label: "Individual", desc: "Landlords, tenants, hosts & service providers", features: ["National ID / Passport", "Selfie verification", "KRA PIN (optional)"] },
              { type: "business" as VerificationType, icon: Building2, label: "Business / Agency", desc: "Registered companies & agencies", features: ["Business Certificate", "KRA PIN (Business)", "CR12 / Directors form"] },
            ].map((opt) => (
              <button
                key={opt.type}
                onClick={() => { setVerificationType(opt.type); setStep("doc_select"); }}
                className="w-full text-left p-4 rounded-2xl border-2 border-border bg-card card-shadow active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <opt.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold">{opt.label}</h3>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-1.5 ml-15">
                  {opt.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground">
                  Your data is encrypted and processed securely. We only use it for identity verification and never share it with third parties.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Document Selection */}
        {step === "doc_select" && (
          <div className="space-y-3 animate-fade-in">
            <h2 className="text-lg font-bold mb-1">Select Document Type</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {verificationType === "individual" ? "Choose a valid government-issued ID" : "Choose a business registration document"}
            </p>

            {(verificationType === "individual" ? individualDocs : businessDocs).map((doc) => (
              <button
                key={doc.type}
                onClick={() => { setDocType(doc.type); setStep("id_upload"); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-border bg-card card-shadow active:scale-[0.98] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <doc.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">{doc.label}</p>
                  <p className="text-xs text-muted-foreground">{doc.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}

            <button onClick={() => setStep("type_select")} className="w-full py-3 text-sm font-medium text-muted-foreground">
              ← Back to type selection
            </button>
          </div>
        )}

        {/* Step 3: ID Upload */}
        {step === "id_upload" && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold mb-1">Upload Your Document</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Take a clear photo of your {docType === "national_id" ? "National ID" : docType === "passport" ? "Passport" : docType === "business_cert" ? "Business Certificate" : docType === "cr12" ? "CR12 Form" : "KRA PIN Certificate"}
            </p>

            {/* Front */}
            <div
              onClick={() => setIdFrontUploaded(true)}
              className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all active:scale-[0.98] ${
                idFrontUploaded ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
            >
              {idFrontUploaded ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                  <p className="text-sm font-semibold text-primary">Front side uploaded</p>
                  <p className="text-xs text-muted-foreground">Tap to retake</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                    <Camera className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold">Front Side</p>
                  <p className="text-xs text-muted-foreground">Tap to capture or upload</p>
                </div>
              )}
            </div>

            {/* Back (only for national ID) */}
            {(docType === "national_id") && (
              <div
                onClick={() => setIdBackUploaded(true)}
                className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all active:scale-[0.98] ${
                  idBackUploaded ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                {idBackUploaded ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                    <p className="text-sm font-semibold text-primary">Back side uploaded</p>
                    <p className="text-xs text-muted-foreground">Tap to retake</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                      <Camera className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold">Back Side</p>
                    <p className="text-xs text-muted-foreground">Tap to capture or upload</p>
                  </div>
                )}
              </div>
            )}

            <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-[11px] text-muted-foreground">
                📸 <span className="font-semibold text-accent-foreground">Tips:</span> Ensure good lighting, avoid glare, capture all four corners clearly.
              </p>
            </div>

            <button
              onClick={() => setStep("selfie")}
              disabled={!idFrontUploaded || (docType === "national_id" && !idBackUploaded)}
              className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-all disabled:opacity-40"
            >
              Continue to Selfie
            </button>

            <button onClick={() => setStep("doc_select")} className="w-full py-2 text-sm font-medium text-muted-foreground">
              ← Back
            </button>
          </div>
        )}

        {/* Step 4: Selfie Capture */}
        {step === "selfie" && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold mb-1">Selfie Verification</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {verificationType === "individual" 
                ? "Take a selfie to match with your ID photo" 
                : "Director/representative selfie for business verification"}
            </p>

            <div
              onClick={() => {
                setSelfieCapture("capturing");
                setTimeout(() => setSelfieCapture("done"), 1500);
              }}
              className={`aspect-square max-w-[280px] mx-auto rounded-[50%] border-4 flex items-center justify-center cursor-pointer transition-all ${
                selfieCapture === "done" ? "border-primary bg-primary/5" : selfieCapture === "capturing" ? "border-accent animate-pulse bg-accent/5" : "border-dashed border-border bg-card"
              }`}
            >
              {selfieCapture === "done" ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                  <p className="text-sm font-semibold text-primary">Captured!</p>
                </div>
              ) : selfieCapture === "capturing" ? (
                <div className="flex flex-col items-center gap-2">
                  <Fingerprint className="w-12 h-12 text-accent animate-pulse" />
                  <p className="text-sm font-semibold text-accent-foreground">Analyzing...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                  <p className="text-sm font-semibold">Tap to Capture</p>
                  <p className="text-xs text-muted-foreground">Position face in oval</p>
                </div>
              )}
            </div>

            <div className="space-y-2 mt-4">
              {["Look directly at the camera", "Ensure even lighting on your face", "Remove glasses, hats, or face coverings", "Keep a neutral expression"].map((tip) => (
                <div key={tip} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>

            {/* AI Photo Verification */}
            {selfieCapture === "done" && (
              <AIPhotoVerification mode="identity" simulateMatch={true} />
            )}

            <button
              onClick={handleProcessing}
              disabled={selfieCapture !== "done"}
              className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-all disabled:opacity-40 mt-4"
            >
              Submit for Verification
            </button>

            <button onClick={() => setStep("id_upload")} className="w-full py-2 text-sm font-medium text-muted-foreground">
              ← Back
            </button>
          </div>
        )}

        {/* Step 5: Processing */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="w-20 h-20 rounded-full gradient-trust flex items-center justify-center mb-5 animate-pulse">
              <Fingerprint className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">Verifying Your Identity</h2>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-[260px]">
              Cross-referencing your document with your selfie. This usually takes a few seconds...
            </p>
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <div className="mt-8 space-y-2 w-full max-w-xs">
              {["Document quality check", "Face matching", "Database verification"].map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: `${i * 1.2}s` }}>
                  <Clock className="w-3 h-3 text-primary shrink-0 animate-spin" />
                  <span>{s}...</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Result */}
        {step === "result" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            {result === "success" ? (
              <>
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5 animate-[pulse_1s_ease-in-out_2]">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Verified! ✓</h2>
                <p className="text-sm text-muted-foreground text-center mb-6 max-w-[280px]">
                  Your identity has been verified successfully. You now have the trusted badge on your profile.
                </p>
                <div className="verified-badge text-sm px-4 py-2 mb-6">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified {verificationType === "business" ? "Business" : "Member"}</span>
                </div>
                <div className="w-full max-w-xs space-y-2">
                  {["Trusted badge on profile", "Priority in search results", "Higher response rates", "Access to premium features"].map((b) => (
                    <div key={b} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Verification Failed</h2>
                <p className="text-sm text-muted-foreground text-center mb-6 max-w-[280px]">
                  We couldn't verify your identity. This could be due to poor image quality or a mismatch. Please try again.
                </p>
                <div className="w-full max-w-xs space-y-2 mb-6">
                  {["Ensure document is not expired", "Use better lighting", "Remove any obstructions from face", "Make sure all text is readable"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="w-3 h-3 text-destructive shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={result === "success" ? onClose : () => { setStep("id_upload"); setIdFrontUploaded(false); setIdBackUploaded(false); setSelfieCapture("none"); }}
              className="w-full max-w-xs py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-all mt-4"
            >
              {result === "success" ? "Done" : "Try Again"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCVerificationFlow;
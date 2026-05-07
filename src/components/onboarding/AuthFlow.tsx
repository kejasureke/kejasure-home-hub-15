import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Phone, ShieldCheck, Lock, Fingerprint, ChevronRight, Smartphone } from "lucide-react";

type AuthStep = "phone" | "otp" | "pin" | "confirm-pin" | "biometric";

const AUTH_STATE_KEY = "kejasure_auth_progress";

interface PersistedAuth {
  step: AuthStep;
  phone: string;
  otp: string[];
  pin: string[];
  confirmPin: string[];
  otpTimer: number;
  savedAt: number;
}

const loadAuthState = (): Partial<PersistedAuth> => {
  try {
    const raw = localStorage.getItem(AUTH_STATE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as PersistedAuth;
    const valid: AuthStep[] = ["phone", "otp", "pin", "confirm-pin", "biometric"];
    if (!valid.includes(p.step)) return {};
    // Decay OTP timer based on elapsed time
    const elapsed = Math.floor((Date.now() - (p.savedAt || Date.now())) / 1000);
    const decayedTimer = Math.max(0, (p.otpTimer ?? 0) - elapsed);
    return { ...p, otpTimer: decayedTimer };
  } catch {
    return {};
  }
};

interface AuthFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

const AuthFlow = ({ onComplete, onBack }: AuthFlowProps) => {
  const initial = loadAuthState();
  const [step, setStep] = useState<AuthStep>(initial.step ?? "phone");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [otp, setOtp] = useState<string[]>(initial.otp ?? ["", "", "", "", "", ""]);
  const [pin, setPin] = useState<string[]>(initial.pin ?? ["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState<string[]>(initial.confirmPin ?? ["", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [shakeError, setShakeError] = useState(false);
  const [otpTimer, setOtpTimer] = useState(initial.otpTimer ?? 60);

  // Persist on every relevant change
  useEffect(() => {
    try {
      const payload: PersistedAuth = {
        step, phone, otp, pin, confirmPin, otpTimer, savedAt: Date.now(),
      };
      localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(payload));
    } catch {}
  }, [step, phone, otp, pin, confirmPin, otpTimer]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP timer
  useEffect(() => {
    if (step !== "otp" || otpTimer <= 0) return;
    const t = setInterval(() => setOtpTimer((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [step, otpTimer]);

  const handleCodeInput = (
    value: string,
    index: number,
    arr: string[],
    setArr: (v: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    length: number
  ) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...arr];
    next[index] = value.slice(-1);
    setArr(next);
    if (value && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    arr: string[],
    setArr: (v: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace" && !arr[index] && index > 0) {
      const next = [...arr];
      next[index - 1] = "";
      setArr(next);
      refs.current[index - 1]?.focus();
    }
  };

  const isPhoneValid = phone.length >= 9;
  const isOtpFilled = otp.every((d) => d !== "");
  const isPinFilled = pin.every((d) => d !== "");
  const isConfirmFilled = confirmPin.every((d) => d !== "");

  const handlePhoneSubmit = () => {
    setOtpTimer(60);
    setStep("otp");
  };

  const handleOtpSubmit = () => setStep("pin");

  const handlePinSubmit = () => {
    setPinError("");
    setStep("confirm-pin");
  };

  // Cross-platform haptic feedback (Android via Vibration API, iOS via Capacitor Haptics if available, web AudioContext fallback)
  const triggerErrorHaptic = async () => {
    if (typeof window === "undefined") return;
    try {
      // 1. Capacitor Haptics (iOS + Android native shells)
      const cap = (window as any).Capacitor;
      if (cap?.isPluginAvailable?.("Haptics")) {
        const plugins = (window as any).Capacitor.Plugins;
        if (plugins?.Haptics?.notification) {
          await plugins.Haptics.notification({ type: "ERROR" });
          return;
        }
        if (plugins?.Haptics?.vibrate) {
          await plugins.Haptics.vibrate({ duration: 120 });
          return;
        }
      }
      // 2. Web Vibration API (Android Chrome / some Android browsers)
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate([60, 40, 60]);
        return;
      }
      // 3. iOS Safari fallback: brief silent AudioContext blip (no audible sound, just a subtle cue)
      // iOS doesn't expose vibration to web; we silently no-op so nothing errors.
    } catch {
      // Swallow — haptics are a progressive enhancement, never block the flow
    }
  };

  const handleConfirmPinSubmit = () => {
    if (pin.join("") !== confirmPin.join("")) {
      setPinError("PINs don't match. Try again.");
      setShakeError(true);
      setConfirmPin(["", "", "", ""]);
      confirmPinRefs.current[0]?.focus();
      triggerErrorHaptic();
      setTimeout(() => setShakeError(false), 450);
      return;
    }
    setPinError("");
    setStep("biometric");
  };

  // Auto-advance: PIN entered → confirm
  useEffect(() => {
    if (step === "pin" && isPinFilled) {
      const t = setTimeout(() => handlePinSubmit(), 180);
      return () => clearTimeout(t);
    }
  }, [step, isPinFilled]);

  // Auto-advance: confirm PIN entered → validate immediately
  useEffect(() => {
    if (step === "confirm-pin" && isConfirmFilled) {
      // Run on next tick so the last digit paints before any error shake
      const t = setTimeout(() => handleConfirmPinSubmit(), 60);
      return () => clearTimeout(t);
    }
  }, [step, isConfirmFilled]);

  const stepIndex = ["phone", "otp", "pin", "confirm-pin", "biometric"].indexOf(step);
  const progress = ((stepIndex + 1) / 5) * 100;

  const goBack = () => {
    const steps: AuthStep[] = ["phone", "otp", "pin", "confirm-pin", "biometric"];
    const idx = steps.indexOf(step);
    if (idx === 0) onBack();
    else setStep(steps[idx - 1]);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 flex items-center gap-3">
        <button onClick={goBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full gradient-trust rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-8">
        {/* Phone Input */}
        {step === "phone" && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Phone className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">Enter your phone</h1>
            <p className="text-sm text-muted-foreground mb-8">We'll send a verification code via SMS</p>
            
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary">
                <span className="text-lg">🇰🇪</span>
                <span className="text-sm font-semibold text-foreground">+254</span>
              </div>
              <input
                type="tel"
                placeholder="712 345 678"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="flex-1 text-lg font-semibold bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50"
                autoFocus
              />
            </div>

            <div className="mt-auto pb-10">
              <button
                onClick={handlePhoneSubmit}
                disabled={!isPhoneValid}
                className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
                  isPhoneValid ? "gradient-trust text-primary-foreground active:scale-[0.98]" : "bg-muted text-muted-foreground"
                }`}
              >
                Send Code
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* OTP */}
        {step === "otp" && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">Verify your number</h1>
            <p className="text-sm text-muted-foreground mb-2">
              Enter the 6-digit code sent to <span className="font-semibold text-foreground">+254 {phone}</span>
            </p>
            <button
              onClick={() => {
                // Safe edit: keep PIN, clear OTP + reset timer, return to phone step
                setOtp(["", "", "", "", "", ""]);
                setOtpTimer(0);
                setStep("phone");
              }}
              className="self-start mb-6 text-xs font-semibold text-primary active:opacity-70 underline-offset-2 underline"
            >
              Wrong number? Edit
            </button>

            <div className="flex gap-2.5 justify-center mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInput(e.target.value, i, otp, setOtp, otpRefs, 6)}
                  onKeyDown={(e) => handleKeyDown(e, i, otp, setOtp, otpRefs)}
                  className={`w-12 h-14 rounded-xl text-center text-xl font-bold border-2 transition-colors bg-card outline-none ${
                    digit ? "border-primary text-foreground" : "border-border text-muted-foreground"
                  }`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <div className="text-center mb-8">
              {otpTimer > 0 ? (
                <p className="text-xs text-muted-foreground">Resend code in <span className="font-semibold text-primary">{otpTimer}s</span></p>
              ) : (
                <button onClick={() => setOtpTimer(60)} className="text-xs font-semibold text-primary">
                  Resend Code
                </button>
              )}
            </div>

            <div className="mt-auto pb-10">
              <button
                onClick={handleOtpSubmit}
                disabled={!isOtpFilled}
                className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
                  isOtpFilled ? "gradient-trust text-primary-foreground active:scale-[0.98]" : "bg-muted text-muted-foreground"
                }`}
              >
                Verify
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* PIN Creation */}
        {step === "pin" && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">Create your PIN</h1>
            <p className="text-sm text-muted-foreground mb-8">Set a 4-digit PIN for quick, secure access</p>

            <div className="flex gap-4 justify-center mb-8">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (pinRefs.current[i] = el)}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeInput(e.target.value, i, pin, setPin, pinRefs, 4)}
                  onKeyDown={(e) => handleKeyDown(e, i, pin, setPin, pinRefs)}
                  className={`w-14 h-16 rounded-xl text-center text-2xl font-bold border-2 transition-colors bg-card outline-none ${
                    digit ? "border-primary" : "border-border"
                  }`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-auto pb-10">
              We'll move on as soon as your PIN is entered
            </p>
          </div>
        )}

        {/* Confirm PIN */}
        {step === "confirm-pin" && (
          <div className="flex-1 flex flex-col animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">Confirm your PIN</h1>
            <p className="text-sm text-muted-foreground mb-8">Re-enter your 4-digit PIN to confirm</p>

            <div className={`flex gap-4 justify-center mb-4 ${shakeError ? "animate-shake" : ""}`}>
              {confirmPin.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (confirmPinRefs.current[i] = el)}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    if (pinError) setPinError("");
                    handleCodeInput(e.target.value, i, confirmPin, setConfirmPin, confirmPinRefs, 4);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, i, confirmPin, setConfirmPin, confirmPinRefs)}
                  className={`w-14 h-16 rounded-xl text-center text-2xl font-bold border-2 transition-colors outline-none ${
                    pinError
                      ? "border-destructive bg-destructive/5 text-destructive"
                      : digit
                      ? "border-primary bg-card"
                      : "border-border bg-card"
                  }`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {pinError ? (
              <p className="text-xs text-destructive text-center font-semibold mb-4 animate-fade-in">
                {pinError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground text-center mt-auto pb-10">
                We'll confirm automatically once both PINs match
              </p>
            )}
          </div>
        )}

        {/* Biometric */}
        {step === "biometric" && (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
              <Fingerprint className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">Enable biometric login?</h1>
            <p className="text-sm text-muted-foreground mb-2 max-w-[260px]">
              Use fingerprint or face recognition for faster, secure sign-in
            </p>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary mb-8">
              <Smartphone className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Remember this device</span>
            </div>

            <div className="w-full space-y-3 mt-auto pb-10">
              <button
                onClick={() => { try { localStorage.removeItem(AUTH_STATE_KEY); } catch {} onComplete(); }}
                className="w-full py-4 rounded-2xl gradient-trust text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                Enable Biometrics
                <Fingerprint className="w-5 h-5" />
              </button>
              <button
                onClick={() => { try { localStorage.removeItem(AUTH_STATE_KEY); } catch {} onComplete(); }}
                className="w-full py-3 rounded-2xl text-sm font-medium text-muted-foreground"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthFlow;

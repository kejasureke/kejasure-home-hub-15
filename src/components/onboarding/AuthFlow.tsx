import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Phone, ShieldCheck, Lock, Fingerprint, ChevronRight, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type AuthStep = "phone" | "otp" | "pin" | "confirm-pin" | "biometric";

const AUTH_STATE_KEY = "kejasure_auth_progress";
const OTP_DURATION = 60; // seconds

interface PersistedAuth {
  step: AuthStep;
  phone: string;
  otp: string[];
  pin: string[];
  confirmPin: string[];
  otpExpiresAt: number | null; // epoch ms, null = no active cooldown
}

const computeRemaining = (expiresAt: number | null): number => {
  if (!expiresAt) return 0;
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
};

const loadAuthState = (): Partial<PersistedAuth> => {
  try {
    const raw = localStorage.getItem(AUTH_STATE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as PersistedAuth;
    const valid: AuthStep[] = ["phone", "otp", "pin", "confirm-pin", "biometric"];
    if (!valid.includes(p.step)) return {};
    return p;
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
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(initial.otpExpiresAt ?? null);
  const [otpTimer, setOtpTimer] = useState<number>(computeRemaining(initial.otpExpiresAt ?? null));
  const [lockoutExpiresAt, setLockoutExpiresAt] = useState<number | null>(null);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Persist on every relevant change
  useEffect(() => {
    try {
      const payload: PersistedAuth = { step, phone, otp, pin, confirmPin, otpExpiresAt };
      localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(payload));
    } catch {}
  }, [step, phone, otp, pin, confirmPin, otpExpiresAt]);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP timer — derived from absolute expiry, ticks each second; recovers correctly after refresh
  useEffect(() => {
    if (step !== "otp" || !otpExpiresAt) return;
    setOtpTimer(computeRemaining(otpExpiresAt));
    const t = setInterval(() => {
      const remaining = computeRemaining(otpExpiresAt);
      setOtpTimer(remaining);
      if (remaining <= 0) clearInterval(t);
    }, 1000);
    return () => clearInterval(t);
  }, [step, otpExpiresAt]);

  // Re-sync timer when tab/app becomes visible again
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setOtpTimer(computeRemaining(otpExpiresAt));
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [otpExpiresAt]);

  // Lockout countdown — ticks down a fixed expiry from server retryAfter
  useEffect(() => {
    if (!lockoutExpiresAt) {
      setLockoutTimer(0);
      return;
    }
    setLockoutTimer(computeRemaining(lockoutExpiresAt));
    const t = setInterval(() => {
      const remaining = computeRemaining(lockoutExpiresAt);
      setLockoutTimer(remaining);
      if (remaining <= 0) {
        clearInterval(t);
        setLockoutExpiresAt(null);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [lockoutExpiresAt]);


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

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Normalize Kenyan phone to E.164 (+254XXXXXXXXX)
  const toE164 = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const trimmed = digits.startsWith("0") ? digits.slice(1) : digits;
    return `+254${trimmed}`;
  };

  // Parse server-provided cooldown from rate-limit errors (e.g. "after 47 seconds")
  const parseRetryAfter = (msg?: string): number | null => {
    if (!msg) return null;
    const m = msg.match(/(\d+)\s*second/i);
    return m ? parseInt(m[1], 10) : null;
  };

  const sendOtp = async (isResend = false) => {
    if (sending) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("otp-send", {
        body: { phone: toE164(phone) },
      });

      // FunctionsHttpError exposes the response so we can read structured 429 payloads
      if (error) {
        let payload: any = null;
        try {
          payload = await (error as any).context?.response?.json?.();
        } catch {}
        const retry = payload?.retryAfter ?? parseRetryAfter(payload?.error ?? error.message);
        if (retry) {
          setOtpExpiresAt(Date.now() + retry * 1000);
          if (!isResend) setStep("otp");
          toast({
            title: "Please wait",
            description: payload?.error ?? `You can request a new code in ${retry}s.`,
          });
        } else {
          toast({
            title: "Couldn't send code",
            description: payload?.error ?? error.message,
            variant: "destructive",
          });
        }
        return;
      }

      const cooldown = (data as any)?.cooldownSeconds ?? OTP_DURATION;
      setOtpExpiresAt(Date.now() + cooldown * 1000);
      if (!isResend) setStep("otp");
      if (isResend) toast({ title: "New code sent" });
    } catch (e: any) {
      toast({
        title: "Network error",
        description: e?.message ?? "Try again",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handlePhoneSubmit = () => sendOtp(false);

  const handleOtpSubmit = async () => {
    if (verifying) return;
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("otp-verify", {
        body: { phone: toE164(phone), token: otp.join("") },
      });

      if (error) {
        let payload: any = null;
        try {
          payload = await (error as any).context?.response?.json?.();
        } catch {}
        const retry = payload?.retryAfter;
        const remaining = payload?.remainingAttempts;
        if (retry) {
          toast({
            title: "Locked out",
            description: payload?.error ?? `Try again in ${retry}s.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Invalid code",
            description:
              (payload?.error ?? error.message) +
              (typeof remaining === "number" ? ` (${remaining} attempts left)` : ""),
            variant: "destructive",
          });
        }
        return;
      }

      // Establish the auth session locally
      const session = (data as any)?.session;
      if (session?.access_token && session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }

      setStep("pin");
    } finally {
      setVerifying(false);
    }
  };

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
                setOtpExpiresAt(null);
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
                <button onClick={() => sendOtp(true)} disabled={sending} className="text-xs font-semibold text-primary disabled:opacity-50">
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

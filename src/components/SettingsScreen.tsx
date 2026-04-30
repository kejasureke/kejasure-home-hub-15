import { useState, useEffect } from "react";
import { ArrowLeft, Bell, Lock, Globe, Trash2, Moon, Sun, Eye, Shield, ChevronRight, ToggleLeft, ToggleRight, Smartphone, MapPin, Volume2 } from "lucide-react";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import { useTheme } from "@/hooks/useTheme";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const { closing, triggerClose } = useOverlayClose(onBack);
  const { theme, setTheme } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showVisibility, setShowVisibility] = useState(false);
  const [visibility, setVisibility] = useState<"everyone" | "verified" | "private">("everyone");
  const [showPinFlow, setShowPinFlow] = useState(false);
  const [pinStep, setPinStep] = useState<"current" | "new" | "confirm" | "otp" | "done">("current");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpResendIn, setOtpResendIn] = useState(0);
  const maskedPhone = "+254 712 ••• 678";

  useEffect(() => {
    if (otpResendIn <= 0) return;
    const t = setInterval(() => setOtpResendIn((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [otpResendIn]);

  const generateOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(code);
    setOtpInput("");
    setOtpResendIn(30);
  };

  const visibilityLabel = visibility === "everyone" ? "Everyone" : visibility === "verified" ? "Verified users only" : "Private";

  const closePinFlow = () => {
    setShowPinFlow(false);
    setPinStep("current");
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setPinError("");
    setOtpCode("");
    setOtpInput("");
    setOtpResendIn(0);
  };

  const handlePinSubmit = () => {
    setPinError("");
    if (pinStep === "current") {
      if (currentPin.length !== 4) return setPinError("Enter your 4-digit PIN");
      setPinStep("new");
    } else if (pinStep === "new") {
      if (newPin.length !== 4) return setPinError("New PIN must be 4 digits");
      if (newPin === currentPin) return setPinError("New PIN must differ from current");
      setPinStep("confirm");
    } else if (pinStep === "confirm") {
      if (confirmPin !== newPin) return setPinError("PINs do not match");
      generateOtp();
      setPinStep("otp");
    } else if (pinStep === "otp") {
      if (otpInput.length !== 6) return setPinError("Enter the 6-digit code");
      if (otpInput !== otpCode) return setPinError("Incorrect code. Try again.");
      setPinStep("done");
    }
  };

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="shrink-0">
      {enabled ? (
        <ToggleRight className="w-8 h-8 text-primary" />
      ) : (
        <ToggleLeft className="w-8 h-8 text-muted-foreground" />
      )}
    </button>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{title}</h3>
      <div className="space-y-1 bg-card rounded-2xl card-shadow overflow-hidden">{children}</div>
    </div>
  );

  const SettingRow = ({ icon: Icon, label, subtitle, right, onClick }: { icon: any; label: string; subtitle?: string; right: React.ReactNode; onClick?: () => void }) => {
    const content = (
      <>
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold">{label}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </>
    );
    return onClick ? (
      <button onClick={onClick} className="w-full flex items-center gap-3 p-4 border-b border-border last:border-b-0 active:bg-secondary/40 transition-colors">
        {content}
      </button>
    ) : (
      <div className="flex items-center gap-3 p-4 border-b border-border last:border-b-0">{content}</div>
    );
  };

  return (
    <div className={`fixed inset-0 z-[60] bg-background overflow-y-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}>
      <div className="sticky top-0 z-10 glass-surface border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={triggerClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold">Settings</h1>
      </div>

      <div className="px-4 py-5 pb-20">
        <Section title="Notifications">
          <SettingRow icon={Bell} label="Push Notifications" subtitle="Listing alerts & messages" right={<Toggle enabled={pushEnabled} onToggle={() => setPushEnabled(!pushEnabled)} />} />
          <SettingRow icon={Smartphone} label="SMS Alerts" subtitle="Important updates via SMS" right={<Toggle enabled={smsEnabled} onToggle={() => setSmsEnabled(!smsEnabled)} />} />
          <SettingRow icon={Bell} label="Price Drop Alerts" subtitle="Get notified on price changes" right={<Toggle enabled={priceAlerts} onToggle={() => setPriceAlerts(!priceAlerts)} />} />
          <SettingRow icon={Volume2} label="Notification Sound" subtitle="Play sound for alerts" right={<Toggle enabled={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />} />
        </Section>

        <Section title="Privacy & Security">
          <SettingRow icon={Lock} label="Biometric Login" subtitle="Use fingerprint or face unlock" right={<Toggle enabled={biometricEnabled} onToggle={() => setBiometricEnabled(!biometricEnabled)} />} />
          <SettingRow icon={MapPin} label="Location Services" subtitle="Nearby listings & map features" right={<Toggle enabled={locationEnabled} onToggle={() => setLocationEnabled(!locationEnabled)} />} />
          <SettingRow icon={Eye} label="Profile Visibility" subtitle={visibilityLabel} right={<ChevronRight className="w-4 h-4 text-muted-foreground" />} onClick={() => setShowVisibility(true)} />
          <SettingRow icon={Shield} label="Change PIN" subtitle="Update your 4-digit PIN" right={<ChevronRight className="w-4 h-4 text-muted-foreground" />} onClick={() => setShowPinFlow(true)} />
        </Section>

        <Section title="Preferences">
          <SettingRow
            icon={Globe}
            label="Language"
            subtitle={language === "en" ? "English" : "Kiswahili"}
            right={
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-xs font-semibold bg-secondary rounded-lg px-3 py-1.5 text-foreground border-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
              </select>
            }
          />
        </Section>

        <Section title="Account">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3 p-4 text-destructive"
          >
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4 text-destructive" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Delete Account</p>
              <p className="text-[11px] text-destructive/70">Permanently delete your account & data</p>
            </div>
          </button>
        </Section>

        <p className="text-center text-[10px] text-muted-foreground mt-4">KejaSure v1.0.0 · Made in Kenya 🇰🇪</p>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <div className="w-[85%] max-w-sm bg-card rounded-3xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center mb-5">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                <Trash2 className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="text-lg font-bold">Delete Account?</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                This will permanently delete your profile, listings, chats, and all data. This action cannot be undone.
              </p>
            </div>
            <button className="w-full py-3.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold mb-2 active:scale-[0.98] transition-transform">
              Yes, Delete My Account
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} className="w-full py-3 rounded-xl text-sm font-semibold text-muted-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Profile Visibility */}
      {showVisibility && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setShowVisibility(false)}>
          <div className="w-full sm:w-[85%] sm:max-w-sm bg-card rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Eye className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Profile Visibility</h3>
              <p className="text-xs text-muted-foreground text-center mt-1">Choose who can see your profile and contact details</p>
            </div>
            <div className="space-y-2 mb-4">
              {([
                { id: "everyone", label: "Everyone", desc: "All KejaSure users can view your profile" },
                { id: "verified", label: "Verified users only", desc: "Only KYC-verified users can view" },
                { id: "private", label: "Private", desc: "Only people you message can view" },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setVisibility(opt.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-colors ${
                    visibility === opt.id ? "border-primary bg-primary/5" : "border-border bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <div className={`w-4 h-4 rounded-full border-2 ${visibility === opt.id ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setShowVisibility(false)} className="w-full py-3.5 rounded-xl gradient-trust text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform">
              Save
            </button>
          </div>
        </div>
      )}

      {/* Change PIN */}
      {showPinFlow && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={closePinFlow}>
          <div className="w-full sm:w-[85%] sm:max-w-sm bg-card rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {pinStep === "done" ? (
              <div className="flex flex-col items-center py-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold">PIN Updated</h3>
                <p className="text-sm text-muted-foreground text-center mt-1 mb-5">Your 4-digit PIN has been changed successfully.</p>
                <button onClick={closePinFlow} className="w-full py-3.5 rounded-xl gradient-trust text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform">
                  Done
                </button>
              </div>
            ) : pinStep === "otp" ? (
              <>
                <div className="flex flex-col items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">Verify it's you</h3>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    Enter the 6-digit code sent to <span className="font-semibold text-foreground">{maskedPhone}</span>
                  </p>
                </div>
                <div className="bg-accent/15 border border-accent/30 rounded-xl px-3 py-2 mb-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Demo code (mock SMS)</p>
                  <p className="text-lg font-bold tracking-[0.3em] text-foreground">{otpCode}</p>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setPinError("");
                  }}
                  className="w-full text-center text-2xl tracking-[0.4em] font-bold bg-secondary rounded-xl py-4 mb-2 border-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="••••••"
                />
                {pinError && <p className="text-xs text-destructive text-center mb-2">{pinError}</p>}
                <div className="text-center mb-2">
                  {otpResendIn > 0 ? (
                    <p className="text-[11px] text-muted-foreground">Resend in <span className="font-semibold text-primary">{otpResendIn}s</span></p>
                  ) : (
                    <button onClick={generateOtp} className="text-[11px] font-semibold text-primary">Resend code</button>
                  )}
                </div>
                <button onClick={handlePinSubmit} className="w-full py-3.5 rounded-xl gradient-trust text-primary-foreground text-sm font-bold mt-2 active:scale-[0.98] transition-transform">
                  Verify & Update PIN
                </button>
                <button onClick={closePinFlow} className="w-full py-3 rounded-xl text-sm font-semibold text-muted-foreground">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">
                    {pinStep === "current" ? "Enter Current PIN" : pinStep === "new" ? "Set New PIN" : "Confirm New PIN"}
                  </h3>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {pinStep === "current" ? "Verify it's really you" : pinStep === "new" ? "Choose a new 4-digit PIN" : "Re-enter your new PIN"}
                  </p>
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  autoFocus
                  value={pinStep === "current" ? currentPin : pinStep === "new" ? newPin : confirmPin}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setPinError("");
                    if (pinStep === "current") setCurrentPin(v);
                    else if (pinStep === "new") setNewPin(v);
                    else setConfirmPin(v);
                  }}
                  className="w-full text-center text-3xl tracking-[0.6em] font-bold bg-secondary rounded-xl py-4 mb-2 border-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="••••"
                />
                {pinError && <p className="text-xs text-destructive text-center mb-2">{pinError}</p>}
                <button onClick={handlePinSubmit} className="w-full py-3.5 rounded-xl gradient-trust text-primary-foreground text-sm font-bold mt-2 active:scale-[0.98] transition-transform">
                  {pinStep === "confirm" ? "Send SMS Code" : "Continue"}
                </button>
                <button onClick={closePinFlow} className="w-full py-3 rounded-xl text-sm font-semibold text-muted-foreground">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
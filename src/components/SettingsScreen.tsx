import { useState } from "react";
import { ArrowLeft, Bell, Lock, Globe, Trash2, Moon, Eye, Shield, ChevronRight, ToggleLeft, ToggleRight, Smartphone, MapPin, Volume2 } from "lucide-react";

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [language, setLanguage] = useState("en");

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

  const SettingRow = ({ icon: Icon, label, subtitle, right }: { icon: any; label: string; subtitle?: string; right: React.ReactNode }) => (
    <div className="flex items-center gap-3 p-4 border-b border-border last:border-b-0">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto">
      <div className="sticky top-0 z-10 glass-surface border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold">Settings</h1>
      </div>

      <div className="px-4 py-5 pb-20">
        <Section title="Notifications">
          <SettingRow icon={Bell} label="Push Notifications" subtitle="Listing alerts & messages" right={<Toggle enabled={pushEnabled} onToggle={() => setPushEnabled(!pushEnabled)} />} />
          <SettingRow icon={Smartphone} label="SMS Alerts" subtitle="Important updates via SMS" right={<Toggle enabled={smsEnabled} onToggle={() => setSmsEnabled(!smsEnabled)} />} />
          <SettingRow icon={Bell} label="Email Notifications" subtitle="Weekly digest & promotions" right={<Toggle enabled={emailEnabled} onToggle={() => setEmailEnabled(!emailEnabled)} />} />
          <SettingRow icon={Bell} label="Price Drop Alerts" subtitle="Get notified on price changes" right={<Toggle enabled={priceAlerts} onToggle={() => setPriceAlerts(!priceAlerts)} />} />
          <SettingRow icon={Volume2} label="Notification Sound" subtitle="Play sound for alerts" right={<Toggle enabled={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />} />
        </Section>

        <Section title="Privacy & Security">
          <SettingRow icon={Lock} label="Biometric Login" subtitle="Use fingerprint or face unlock" right={<Toggle enabled={biometricEnabled} onToggle={() => setBiometricEnabled(!biometricEnabled)} />} />
          <SettingRow icon={MapPin} label="Location Services" subtitle="Nearby listings & map features" right={<Toggle enabled={locationEnabled} onToggle={() => setLocationEnabled(!locationEnabled)} />} />
          <SettingRow icon={Eye} label="Profile Visibility" subtitle="Who can see your profile" right={<ChevronRight className="w-4 h-4 text-muted-foreground" />} />
          <SettingRow icon={Shield} label="Change PIN" subtitle="Update your 4-digit PIN" right={<ChevronRight className="w-4 h-4 text-muted-foreground" />} />
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
    </div>
  );
};

export default SettingsScreen;
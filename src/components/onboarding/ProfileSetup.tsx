import { useState } from "react";
import { ArrowLeft, MapPin, Wallet, Bed, ChevronRight, Home, Sparkles } from "lucide-react";
import type { UserRole } from "./RoleSelection";

interface ProfileSetupProps {
  role: UserRole;
  onComplete: () => void;
  onBack: () => void;
}

// ─── Tenant Setup ───
const TenantSetup = ({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [counties, setCounties] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [preference, setPreference] = useState("");

  const countyOptions = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Uasin Gishu", "Machakos", "Kajiado"];
  const budgetOptions = ["Under 15K", "15K–30K", "30K–50K", "50K–100K", "100K+"];
  const bedroomOptions = ["Studio", "1 BR", "2 BR", "3 BR", "4+ BR"];

  const steps = [
    {
      icon: MapPin,
      title: "Where are you looking?",
      subtitle: "Select preferred counties",
      content: (
        <div className="flex flex-wrap gap-2">
          {countyOptions.map((c) => (
            <button
              key={c}
              onClick={() => setCounties((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c])}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                counties.includes(c) ? "gradient-trust text-primary-foreground" : "bg-card border border-border text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      ),
      valid: counties.length > 0,
    },
    {
      icon: Wallet,
      title: "What's your budget?",
      subtitle: "Monthly rent range",
      content: (
        <div className="space-y-2.5">
          {budgetOptions.map((b) => (
            <button
              key={b}
              onClick={() => setBudget(b)}
              className={`w-full p-4 rounded-2xl text-left text-sm font-semibold transition-all ${
                budget === b ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-transparent"
              }`}
            >
              KES {b}
            </button>
          ))}
        </div>
      ),
      valid: !!budget,
    },
    {
      icon: Bed,
      title: "Room preferences",
      subtitle: "What size property do you need?",
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {bedroomOptions.map((b) => (
              <button
                key={b}
                onClick={() => setBedrooms(b)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  bedrooms === b ? "gradient-trust text-primary-foreground" : "bg-card border border-border text-foreground"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
          <div className="space-y-2.5 pt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">I'm looking for</p>
            {["Long-term Rental", "Short Stay", "Both"].map((p) => (
              <button
                key={p}
                onClick={() => setPreference(p)}
                className={`w-full p-3.5 rounded-2xl text-left text-sm font-semibold transition-all ${
                  preference === p ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-transparent"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      ),
      valid: !!bedrooms,
    },
  ];

  return <StepRenderer steps={steps} step={step} setStep={setStep} onComplete={onComplete} onBack={onBack} />;
};

// ─── Landlord Setup ───
const LandlordSetup = ({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [idType, setIdType] = useState("");
  const [plan, setPlan] = useState("");

  const steps = [
    {
      icon: MapPin,
      title: "Verify your identity",
      subtitle: "Required for landlord verification badge",
      content: (
        <div className="space-y-3">
          {["National ID", "Passport", "Alien ID"].map((t) => (
            <button
              key={t}
              onClick={() => setIdType(t)}
              className={`w-full p-4 rounded-2xl text-left text-sm font-semibold transition-all ${
                idType === t ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-transparent"
              }`}
            >
              {t}
            </button>
          ))}
          <div className="p-4 rounded-2xl bg-card border-2 border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">📷 Upload {idType || "ID"} photo</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Front & back required</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border-2 border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">📄 KRA PIN Certificate</p>
          </div>
        </div>
      ),
      valid: !!idType,
    },
    {
      icon: Home,
      title: "Ownership proof",
      subtitle: "Upload proof of property ownership",
      content: (
        <div className="space-y-3">
          {["Title Deed", "Sale Agreement", "Rent Agreement (Agent)", "Authorization Letter"].map((d) => (
            <div key={d} className="p-4 rounded-2xl bg-card border-2 border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground">📄 {d}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Tap to upload</p>
            </div>
          ))}
        </div>
      ),
      valid: true,
    },
    {
      icon: Sparkles,
      title: "Choose your plan",
      subtitle: "Select a subscription to start listing",
      content: (
        <div className="space-y-3">
          {[
            { name: "Basic", price: "Free", desc: "1 listing, basic features" },
            { name: "Pro", price: "KES 500/mo", desc: "5 listings, analytics, priority" },
            { name: "Premium", price: "KES 1,500/mo", desc: "Unlimited listings, top placement" },
          ].map((p) => (
            <button
              key={p.name}
              onClick={() => setPlan(p.name)}
              className={`w-full p-4 rounded-2xl text-left transition-all ${
                plan === p.name ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{p.name}</p>
                <p className="text-sm font-bold text-primary">{p.price}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
            </button>
          ))}
        </div>
      ),
      valid: !!plan,
    },
  ];

  return <StepRenderer steps={steps} step={step} setStep={setStep} onComplete={onComplete} onBack={onBack} />;
};

// ─── Agency Setup ───
const AgencySetup = ({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [teamSize, setTeamSize] = useState("");
  const [plan, setPlan] = useState("");

  const steps = [
    {
      icon: MapPin,
      title: "Business documents",
      subtitle: "Verify your agency",
      content: (
        <div className="space-y-3">
          {["Business Certificate", "KRA PIN Certificate", "Agency Logo"].map((d) => (
            <div key={d} className="p-4 rounded-2xl bg-card border-2 border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground">📄 {d}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Tap to upload</p>
            </div>
          ))}
        </div>
      ),
      valid: true,
    },
    {
      icon: Home,
      title: "Agency details",
      subtitle: "Tell us about your team",
      content: (
        <div className="space-y-3">
          {["1-5 agents", "6-15 agents", "16-50 agents", "50+"].map((s) => (
            <button
              key={s}
              onClick={() => setTeamSize(s)}
              className={`w-full p-4 rounded-2xl text-left text-sm font-semibold transition-all ${
                teamSize === s ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      ),
      valid: !!teamSize,
    },
    {
      icon: Sparkles,
      title: "Choose your plan",
      subtitle: "Agency subscription",
      content: (
        <div className="space-y-3">
          {[
            { name: "Starter", price: "KES 2,000/mo", desc: "10 listings, 3 agents" },
            { name: "Growth", price: "KES 5,000/mo", desc: "50 listings, 10 agents, analytics" },
            { name: "Enterprise", price: "KES 15,000/mo", desc: "Unlimited everything" },
          ].map((p) => (
            <button
              key={p.name}
              onClick={() => setPlan(p.name)}
              className={`w-full p-4 rounded-2xl text-left transition-all ${
                plan === p.name ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{p.name}</p>
                <p className="text-sm font-bold text-primary">{p.price}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
            </button>
          ))}
        </div>
      ),
      valid: !!plan,
    },
  ];

  return <StepRenderer steps={steps} step={step} setStep={setStep} onComplete={onComplete} onBack={onBack} />;
};

// ─── Stay Host Setup ───
const StayHostSetup = ({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [propertyType, setPropertyType] = useState("");
  const [plan, setPlan] = useState("");

  const steps = [
    {
      icon: MapPin,
      title: "Host verification",
      subtitle: "Verify your identity to host",
      content: (
        <div className="space-y-3">
          {["National ID (front & back)", "KRA PIN Certificate", "Property Photos"].map((d) => (
            <div key={d} className="p-4 rounded-2xl bg-card border-2 border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground">📄 {d}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Tap to upload</p>
            </div>
          ))}
        </div>
      ),
      valid: true,
    },
    {
      icon: Home,
      title: "Your first stay",
      subtitle: "Set up your property",
      content: (
        <div className="space-y-3">
          {["Apartment", "Villa", "Cottage", "Penthouse", "Studio"].map((t) => (
            <button
              key={t}
              onClick={() => setPropertyType(t)}
              className={`w-full p-4 rounded-2xl text-left text-sm font-semibold transition-all ${
                propertyType === t ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-transparent"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      ),
      valid: !!propertyType,
    },
    {
      icon: Sparkles,
      title: "Choose your plan",
      subtitle: "Host subscription",
      content: (
        <div className="space-y-3">
          {[
            { name: "Starter", price: "Free", desc: "1 property, basic visibility" },
            { name: "Pro Host", price: "KES 1,000/mo", desc: "3 properties, featured placement" },
            { name: "Super Host", price: "KES 3,000/mo", desc: "Unlimited, priority booking, analytics" },
          ].map((p) => (
            <button
              key={p.name}
              onClick={() => setPlan(p.name)}
              className={`w-full p-4 rounded-2xl text-left transition-all ${
                plan === p.name ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{p.name}</p>
                <p className="text-sm font-bold text-primary">{p.price}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
            </button>
          ))}
        </div>
      ),
      valid: !!plan,
    },
  ];

  return <StepRenderer steps={steps} step={step} setStep={setStep} onComplete={onComplete} onBack={onBack} />;
};

// ─── Service Provider Setup ───
const ServiceProviderSetup = ({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [serviceCounties, setServiceCounties] = useState<string[]>([]);
  const [plan, setPlan] = useState("");

  const categories = ["Movers", "Cleaners", "Electricians", "Plumbers", "Internet Installers", "Security", "Painters", "Fumigators"];
  const countyOpts = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Uasin Gishu", "Machakos", "Kajiado"];

  const steps = [
    {
      icon: MapPin,
      title: "Service type",
      subtitle: "Individual or business?",
      content: (
        <div className="space-y-3">
          {["Individual", "Registered Business"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`w-full p-4 rounded-2xl text-left text-sm font-semibold transition-all ${
                type === t ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-transparent"
              }`}
            >
              {t}
            </button>
          ))}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-3">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  category === c ? "gradient-trust text-primary-foreground" : "bg-card border border-border text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      ),
      valid: !!type && !!category,
    },
    {
      icon: Home,
      title: "Coverage & portfolio",
      subtitle: "Where do you serve?",
      content: (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {countyOpts.map((c) => (
              <button
                key={c}
                onClick={() => setServiceCounties((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c])}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  serviceCounties.includes(c) ? "gradient-trust text-primary-foreground" : "bg-card border border-border text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-card border-2 border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">📷 Upload portfolio photos</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Show your best work</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border-2 border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">📄 Verification documents</p>
          </div>
        </div>
      ),
      valid: serviceCounties.length > 0,
    },
    {
      icon: Sparkles,
      title: "Choose your plan",
      subtitle: "Service provider subscription",
      content: (
        <div className="space-y-3">
          {[
            { name: "Free", price: "Free", desc: "1 county, basic listing" },
            { name: "Pro", price: "KES 800/mo", desc: "5 counties, priority booking" },
            { name: "Premium", price: "KES 2,000/mo", desc: "All counties, featured, analytics" },
          ].map((p) => (
            <button
              key={p.name}
              onClick={() => setPlan(p.name)}
              className={`w-full p-4 rounded-2xl text-left transition-all ${
                plan === p.name ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{p.name}</p>
                <p className="text-sm font-bold text-primary">{p.price}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
            </button>
          ))}
        </div>
      ),
      valid: !!plan,
    },
  ];

  return <StepRenderer steps={steps} step={step} setStep={setStep} onComplete={onComplete} onBack={onBack} />;
};

// ─── Shared Step Renderer ───
interface Step {
  icon: any;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  valid: boolean;
}

const StepRenderer = ({
  steps,
  step,
  setStep,
  onComplete,
  onBack,
}: {
  steps: Step[];
  step: number;
  setStep: (s: number) => void;
  onComplete: () => void;
  onBack: () => void;
}) => {
  const current = steps[step];
  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[90] bg-background flex flex-col">
      <div className="px-5 pt-5 flex items-center gap-3">
        <button
          onClick={() => (step === 0 ? onBack() : setStep(step - 1))}
          className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full gradient-trust rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 pt-6 overflow-y-auto">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-xl font-extrabold text-foreground mb-1">{current.title}</h1>
        <p className="text-sm text-muted-foreground mb-6">{current.subtitle}</p>
        {current.content}
      </div>

      <div className="px-6 pb-10 pt-4">
        <button
          onClick={() => (isLast ? onComplete() : setStep(step + 1))}
          disabled={!current.valid}
          className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
            current.valid ? "gradient-trust text-primary-foreground active:scale-[0.98]" : "bg-muted text-muted-foreground"
          }`}
        >
          {isLast ? "Get Started" : "Continue"}
          <ChevronRight className="w-5 h-5" />
        </button>
        {isLast && (
          <button onClick={onComplete} className="w-full py-3 text-sm font-medium text-muted-foreground mt-1">
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Main Router ───
const ProfileSetup = ({ role, onComplete, onBack }: ProfileSetupProps) => {
  switch (role) {
    case "tenant": return <TenantSetup onComplete={onComplete} onBack={onBack} />;
    case "landlord": return <LandlordSetup onComplete={onComplete} onBack={onBack} />;
    case "agency": return <AgencySetup onComplete={onComplete} onBack={onBack} />;
    case "stayhost": return <StayHostSetup onComplete={onComplete} onBack={onBack} />;
    case "serviceprovider": return <ServiceProviderSetup onComplete={onComplete} onBack={onBack} />;
  }
};

export default ProfileSetup;

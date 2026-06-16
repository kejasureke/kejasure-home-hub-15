import { useState } from "react";
import { ArrowLeft, MapPin, Wallet, Bed, ChevronRight, Home, Sparkles, User, FileText, AlertCircle } from "lucide-react";
import type { UserRole } from "./RoleSelection";
import { toast } from "@/hooks/use-toast";
import { upsertProfile } from "@/integrations/supabase/actions";

interface ProfileSetupProps {
  role: UserRole;
  onComplete: () => void;
  onBack: () => void;
}

// ─── Tenant Setup ───
const TenantSetup = ({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [counties, setCounties] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [preference, setPreference] = useState("");

  const countyOptions = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Uasin Gishu", "Machakos", "Kajiado"];
  const budgetOptions = ["Under 15K", "15K–30K", "30K–50K", "50K–100K", "100K+"];
  const bedroomOptions = ["Studio", "1 BR", "2 BR", "3 BR", "4+ BR"];

  const steps = [
    {
      icon: User,
      title: "What's your name?",
      subtitle: "Used for phone verification via smile.id",
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. John"
              className="w-full px-4 py-3.5 rounded-xl bg-card border-2 border-border text-sm font-medium focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Kamau"
              className="w-full px-4 py-3.5 rounded-xl bg-card border-2 border-border text-sm font-medium focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
            <p className="text-[11px] text-muted-foreground">
              📱 Your name will be matched against your phone number's registered owner via smile.id verification.
            </p>
          </div>
        </div>
      ),
      valid: firstName.trim().length > 0 && lastName.trim().length > 0,
    },
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

  const handleComplete = async () => {
    try {
      await upsertProfile({
        role: "tenant",
        first_name: firstName || null,
        last_name: lastName || null,
        display_name: `${firstName} ${lastName}`.trim() || null,
        preferred_counties: counties.length ? counties : null,
        budget_range: budget || null,
        property_count: bedrooms || null,
        stay_type: preference || null,
      });
      onComplete();
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to save your profile",
        description: "Please try again or check your network.",
        variant: "destructive",
      });
    }
  };

  return <StepRenderer steps={steps} step={step} setStep={setStep} onComplete={handleComplete} onBack={onBack} />;
};

// ─── Landlord Setup ───
const LandlordSetup = ({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [propertyCount, setPropertyCount] = useState("");

  const steps = [
    {
      icon: User,
      title: "What's your name?",
      subtitle: "Used for phone verification via smile.id",
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. John"
              className="w-full px-4 py-3.5 rounded-xl bg-card border-2 border-border text-sm font-medium focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Kamau"
              className="w-full px-4 py-3.5 rounded-xl bg-card border-2 border-border text-sm font-medium focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
            <p className="text-[11px] text-muted-foreground">📱 Your name will be matched against your phone number's registered owner via smile.id verification.</p>
          </div>
        </div>
      ),
      valid: firstName.trim().length > 0 && lastName.trim().length > 0,
    },
    {
      icon: Home,
      title: "How many properties?",
      subtitle: "Tell us about your portfolio",
      content: (
        <div className="space-y-2.5">
          {["1 property", "2-5 properties", "6-10 properties", "10+ properties"].map((p) => (
            <button key={p} onClick={() => setPropertyCount(p)}
              className={`w-full p-4 rounded-2xl text-left text-sm font-semibold transition-all ${
                propertyCount === p ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-transparent"
              }`}
            >{p}</button>
          ))}
        </div>
      ),
      valid: !!propertyCount,
    },
  ];

  const handleComplete = async () => {
    try {
      await upsertProfile({
        role: "landlord",
        first_name: firstName || null,
        last_name: lastName || null,
        display_name: `${firstName} ${lastName}`.trim() || null,
        property_count: propertyCount || null,
      });
      onComplete();
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to save your profile",
        description: "Please try again or check your network.",
        variant: "destructive",
      });
    }
  };

  return <StepRenderer steps={steps} step={step} setStep={setStep} onComplete={handleComplete} onBack={onBack} />;
};

// ─── Agency Setup ───
const AgencySetup = ({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agencyName, setAgencyName] = useState("");

  const steps = [
    {
      icon: User,
      title: "What's your name?",
      subtitle: "Used for phone verification via smile.id",
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. John"
              className="w-full px-4 py-3.5 rounded-xl bg-card border-2 border-border text-sm font-medium focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Kamau"
              className="w-full px-4 py-3.5 rounded-xl bg-card border-2 border-border text-sm font-medium focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
            <p className="text-[11px] text-muted-foreground">📱 Your name will be matched against your phone number's registered owner via smile.id verification.</p>
          </div>
        </div>
      ),
      valid: firstName.trim().length > 0 && lastName.trim().length > 0,
    },
    {
      icon: Home,
      title: "Agency name",
      subtitle: "What's your agency called?",
      content: (
        <div className="space-y-3">
          <input type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="e.g. KejaPrime Realtors"
            className="w-full px-4 py-3.5 rounded-xl bg-card border-2 border-border text-sm font-medium focus:outline-none focus:border-primary transition-colors" />
        </div>
      ),
      valid: agencyName.trim().length > 0,
    },
  ];

  const handleComplete = async () => {
    try {
      await upsertProfile({
        role: "agency",
        first_name: firstName || null,
        last_name: lastName || null,
        display_name: `${firstName} ${lastName}`.trim() || null,
        agency_name: agencyName || null,
      });
      onComplete();
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to save your profile",
        description: "Please try again or check your network.",
        variant: "destructive",
      });
    }
  };

  return <StepRenderer steps={steps} step={step} setStep={setStep} onComplete={handleComplete} onBack={onBack} />;
};

// ─── Stay Host Setup ───
const StayHostSetup = ({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const steps = [
    {
      icon: User,
      title: "What's your name?",
      subtitle: "Used for phone verification via smile.id",
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. John"
              className="w-full px-4 py-3.5 rounded-xl bg-card border-2 border-border text-sm font-medium focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Kamau"
              className="w-full px-4 py-3.5 rounded-xl bg-card border-2 border-border text-sm font-medium focus:outline-none focus:border-primary transition-colors" />
          </div>
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
            <p className="text-[11px] text-muted-foreground">📱 Your name will be matched against your phone number's registered owner via smile.id verification.</p>
          </div>
        </div>
      ),
      valid: firstName.trim().length > 0 && lastName.trim().length > 0,
    },
    {
      icon: Home,
      title: "What type of stay?",
      subtitle: "What kind of property will you host?",
      content: (
        <div className="space-y-2.5">
          {["Apartment", "Villa", "Cottage", "Penthouse", "Studio"].map((t) => (
            <button key={t} onClick={() => setPropertyType(t)}
              className={`w-full p-4 rounded-2xl text-left text-sm font-semibold transition-all ${
                propertyType === t ? "bg-primary/10 border-2 border-primary" : "bg-card border-2 border-transparent"
              }`}
            >{t}</button>
          ))}
        </div>
      ),
      valid: !!propertyType,
    },
  ];

  const handleComplete = async () => {
    try {
      await upsertProfile({
        role: "stayhost",
        first_name: firstName || null,
        last_name: lastName || null,
        display_name: `${firstName} ${lastName}`.trim() || null,
        stay_type: propertyType || null,
      });
      onComplete();
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to save your profile",
        description: "Please try again or check your network.",
        variant: "destructive",
      });
    }
  };

  return <StepRenderer steps={steps} step={step} setStep={setStep} onComplete={handleComplete} onBack={onBack} />;
};

// ─── Service Provider Setup ───
const ServiceProviderSetup = ({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [kraUploaded, setKraUploaded] = useState(false);
  const [serviceCounties, setServiceCounties] = useState<string[]>([]);
  const [plan, setPlan] = useState("");

  const categories = ["Movers", "Cleaners", "Electricians", "Plumbers", "Internet Installers", "Security", "Painters", "Fumigators"];
  const countyOpts = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Uasin Gishu", "Machakos", "Kajiado"];

  const isIndividual = type === "Individual";

  const baseSteps = [
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
  ];

  const kraStep = {
    icon: FileText,
    title: "KRA PIN Certificate",
    subtitle: "Required for individual service providers",
    content: (
      <div className="space-y-4">
        <div
          onClick={() => setKraUploaded(true)}
          className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all active:scale-[0.98] ${
            kraUploaded ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
        >
          {kraUploaded ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-10 h-10 text-primary" />
              <p className="text-sm font-semibold text-primary">KRA PIN uploaded</p>
              <p className="text-xs text-muted-foreground">Tap to re-upload</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">Upload KRA PIN Certificate</p>
              <p className="text-xs text-muted-foreground">Tap to upload</p>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/15">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-destructive">Required:</span> KRA PIN is mandatory for all individual service providers.
            </p>
          </div>
        </div>
      </div>
    ),
    valid: kraUploaded,
  };

  const remainingSteps = [
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

  const steps = isIndividual
    ? [...baseSteps, kraStep, ...remainingSteps]
    : [...baseSteps, ...remainingSteps];

  const handleComplete = async () => {
    try {
      await upsertProfile({
        role: "serviceprovider",
        first_name: firstName || null,
        last_name: lastName || null,
        display_name: `${firstName} ${lastName}`.trim() || null,
        service_category: type || null,
        agency_name: category || null,
        preferred_counties: serviceCounties.length ? serviceCounties : null,
        plan_name: plan || null,
      });
      onComplete();
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to save your profile",
        description: "Please try again or check your network.",
        variant: "destructive",
      });
    }
  };

  return <StepRenderer steps={steps} step={step} setStep={setStep} onComplete={handleComplete} onBack={onBack} />;
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

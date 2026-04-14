import { useState } from "react";
import { ArrowLeft, Crown, Check, ShieldCheck, Zap, Star, MapPin, Phone, MessageCircle, BarChart3, Bell, Heart, SlidersHorizontal, TrendingUp, Sparkles, Receipt, Clock } from "lucide-react";
import MpesaPaymentFlow from "./MpesaPaymentFlow";

interface SubscriptionPlansProps {
  onBack: () => void;
  currentRole?: string;
}

const tenantPlans = [
  {
    name: "Free",
    price: 0,
    duration: "Forever",
    features: ["Browse all listings", "Save up to 5 favorites", "Basic search filters", "View landlord ratings"],
    notIncluded: ["Direct contact info", "In-app chat", "Advanced filters", "Priority alerts"],
    current: false,
  },
  {
    name: "Plus",
    price: 299,
    duration: "/month",
    features: ["Everything in Free", "Unlimited favorites", "Direct phone numbers", "In-app chat access", "Advanced filters", "Priority county alerts"],
    notIncluded: ["Featured listing access", "Neighborhood insights"],
    popular: true,
    current: true,
  },
  {
    name: "Premium",
    price: 499,
    duration: "/month",
    features: ["Everything in Plus", "Early access to new listings", "Neighborhood safety scores", "Verified-only feed", "Priority support", "Price drop alerts"],
    notIncluded: [],
    current: false,
  },
];

const landlordPlans = [
  {
    name: "Basic",
    price: 500,
    duration: "/month",
    features: ["3 active listings", "Basic analytics", "Guest inquiries", "Standard placement"],
    notIncluded: ["Boost listings", "Priority support", "Heatmaps"],
    current: false,
  },
  {
    name: "Pro",
    price: 1000,
    duration: "/month",
    features: ["10 active listings", "Full analytics", "Priority chat", "1 monthly boost", "Lead tracking"],
    notIncluded: ["Unlimited listings", "County heatmaps"],
    popular: true,
    current: true,
  },
  {
    name: "Premium",
    price: 2000,
    duration: "/month",
    features: ["Unlimited listings", "Full analytics", "3 monthly boosts", "Featured badge", "County heatmaps", "Priority support"],
    notIncluded: [],
    current: false,
  },
];

const agencyPlans = [
  {
    name: "Starter",
    price: 2000,
    duration: "/month",
    features: ["5 agent accounts", "50 listings", "Basic CRM", "Lead assignment"],
    notIncluded: ["Advanced CRM", "API access"],
    current: false,
  },
  {
    name: "Growth",
    price: 5000,
    duration: "/month",
    features: ["15 agent accounts", "200 listings", "Full CRM", "Lead assignment", "Performance analytics", "5 monthly boosts"],
    notIncluded: ["API access", "White label"],
    popular: true,
    current: true,
  },
  {
    name: "Enterprise",
    price: 10000,
    duration: "/month",
    features: ["Unlimited agents", "Unlimited listings", "Full CRM", "Priority support", "API access", "Custom branding"],
    notIncluded: [],
    current: false,
  },
];

const stayHostPlans = [
  {
    name: "Basic",
    price: 1000,
    duration: "/month",
    features: ["2 stay listings", "Basic calendar", "Guest chat", "Standard placement"],
    notIncluded: ["Smart pricing", "Priority support"],
    current: false,
  },
  {
    name: "Pro",
    price: 2500,
    duration: "/month",
    features: ["10 stay listings", "Full calendar sync", "Priority chat", "Featured stays", "Booking analytics", "2 monthly boosts"],
    notIncluded: ["Smart pricing"],
    popular: true,
    current: true,
  },
  {
    name: "Premium",
    price: 5000,
    duration: "/month",
    features: ["Unlimited listings", "Smart pricing AI", "Priority support", "County heatmaps", "Booking analytics", "5 monthly boosts"],
    notIncluded: [],
    current: false,
  },
];

const serviceProviderPlans = [
  {
    name: "Basic",
    price: 500,
    duration: "/month",
    features: ["1 service listing", "5 bookings/month", "Basic profile", "Client messaging"],
    notIncluded: ["Portfolio gallery", "Priority placement"],
    current: false,
  },
  {
    name: "Pro",
    price: 1000,
    duration: "/month",
    features: ["3 service listings", "Unlimited bookings", "Priority chat", "Portfolio gallery", "Client reviews showcase"],
    notIncluded: ["Team members"],
    popular: true,
    current: true,
  },
  {
    name: "Business",
    price: 3000,
    duration: "/month",
    features: ["10 service listings", "Team members", "CRM tools", "County analytics", "Featured profile", "Priority support"],
    notIncluded: [],
    current: false,
  },
];

const getPlansForRole = (role: string) => {
  switch (role) {
    case "landlord": return { plans: landlordPlans, label: "Landlord" };
    case "agency": return { plans: agencyPlans, label: "Agency" };
    case "stayhost": return { plans: stayHostPlans, label: "Stay Host" };
    case "serviceprovider": return { plans: serviceProviderPlans, label: "Service Provider" };
    default: return { plans: tenantPlans, label: "Tenant" };
  }
};

const SubscriptionPlans = ({ onBack, currentRole }: SubscriptionPlansProps) => {
  const role = currentRole || localStorage.getItem("kejasure_role") || "tenant";
  const { plans, label } = getPlansForRole(role);
  const [selectedPlan, setSelectedPlan] = useState(() => plans.findIndex(p => p.popular) ?? 1);
  const [showPayment, setShowPayment] = useState(false);

  const mpesaPlans = plans.filter(p => p.price > 0).map(p => ({
    name: p.name,
    price: p.price,
    duration: p.duration || "/month",
    features: p.features.slice(0, 4),
    current: p.current,
  }));

  if (showPayment) {
    return (
      <MpesaPaymentFlow
        plans={mpesaPlans}
        selectedPlanIndex={Math.max(0, selectedPlan - (plans[0].price === 0 ? 1 : 0))}
        category={`${label} Subscription`}
        onClose={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto animate-slide-up">
      {/* Header */}
      <div className="gradient-premium px-4 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-5 h-5 text-accent-foreground" />
          </button>
          <h1 className="text-lg font-bold text-accent-foreground">Subscription Plans</h1>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-3">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-white mb-1">Choose Your Plan</h2>
          <p className="text-sm text-white/80">{label} plans tailored for you</p>
        </div>
      </div>

      <div className="px-4 -mt-4 pb-8">
        {/* Trust banner */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-card card-shadow mb-4">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Cancel anytime.</span> No hidden fees. Secure M-Pesa payments.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="space-y-3 mb-6">
          {plans.map((plan, i) => (
            <button
              key={plan.name}
              onClick={() => setSelectedPlan(i)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.98] relative ${
                plan.popular
                  ? selectedPlan === i
                    ? "border-accent gradient-cream-gold card-shadow-hover ring-2 ring-accent/30"
                    : "border-accent/50 gradient-cream-gold"
                  : selectedPlan === i
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full gradient-premium text-[9px] font-bold text-accent-foreground uppercase tracking-wider whitespace-nowrap">
                  ⭐ Most Popular
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-primary text-[9px] font-bold text-primary-foreground uppercase tracking-wider">
                  Current
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selectedPlan === i
                      ? plan.popular ? "border-accent bg-accent" : "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  }`}>
                    {selectedPlan === i && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-foreground">{plan.name}</h3>
                  </div>
                </div>
                <div className="text-right">
                  {plan.price === 0 ? (
                    <span className="text-lg font-extrabold text-foreground">Free</span>
                  ) : (
                    <>
                      <span className="text-lg font-extrabold text-foreground">KES {plan.price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{plan.duration}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-foreground">{f}</span>
                  </div>
                ))}
                {plan.notIncluded?.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs opacity-40">
                    <span className="w-3.5 h-3.5 shrink-0 text-center">—</span>
                    <span className="text-muted-foreground line-through">{f}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        {plans[selectedPlan].price > 0 ? (
          <button
            onClick={() => setShowPayment(true)}
            className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mb-3"
          >
            <Zap className="w-4 h-4" />
            {plans[selectedPlan].current
              ? `Renew ${plans[selectedPlan].name} — KES ${plans[selectedPlan].price.toLocaleString()}/mo`
              : `Upgrade to ${plans[selectedPlan].name} — KES ${plans[selectedPlan].price.toLocaleString()}/mo`}
          </button>
        ) : (
          <div className="w-full py-4 rounded-xl bg-secondary text-sm font-bold text-secondary-foreground text-center mb-3">
            You're on the Free plan
          </div>
        )}

        <p className="text-center text-[10px] text-muted-foreground">
          Billed monthly via M-Pesa · Cancel anytime · No auto-renewal
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;

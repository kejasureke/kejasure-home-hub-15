import { useState } from "react";
import { ArrowLeft, Crown, Check, ShieldCheck, Zap, Star, MapPin, Phone, MessageCircle, BarChart3, Bell, Heart, SlidersHorizontal, TrendingUp, Sparkles, Receipt, Clock } from "lucide-react";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import { toast } from "@/hooks/use-toast";
import MpesaPaymentFlow from "./MpesaPaymentFlow";

interface SubscriptionPlansProps {
  onBack: () => void;
  currentRole?: string;
}

const tenantPlans = [
  {
    name: "24 Hours",
    price: 30,
    duration: "",
    features: ["Exact map pin location", "Full landlord phone number", "In-app chat access", "Direct service contact", "Short stay booking confirmation"],
    notIncluded: ["Unlimited favorites", "Advanced filters", "Verified featured listings first"],
    current: false,
  },
  {
    name: "3 Days",
    price: 50,
    duration: "",
    features: ["Everything in 24 Hours", "Unlimited favorites", "Advanced filters", "Priority county alerts", "Verified featured listings first"],
    notIncluded: ["Price drop alerts"],
    popular: true,
    current: false,
  },
  {
    name: "7 Days",
    price: 100,
    duration: "",
    features: ["Everything in 3 Days", "Price drop alerts", "Neighborhood safety scores", "Verified-only feed", "Priority support"],
    notIncluded: [],
    current: false,
  },
];

const landlordPlans = [
  {
    name: "Basic",
    price: 500,
    duration: "/month",
    badge: "Individual",
    features: ["1 active listing", "Residential rentals only", "Single-owner profile", "Guest inquiries via chat", "Standard placement"],
    notIncluded: ["Multiple agents", "CRM tools", "Commercial premises", "Corporate stays", "Boost listings"],
    current: false,
  },
  {
    name: "Pro",
    price: 1500,
    duration: "/month",
    badge: "Individual",
    features: ["5 active listings", "Residential rentals only", "Basic analytics", "Priority chat replies", "1 monthly boost"],
    notIncluded: ["Multiple agents", "CRM tools", "Commercial premises", "Corporate stays", "County heatmaps"],
    popular: true,
    current: false,
  },
  {
    name: "Premium",
    price: 2500,
    duration: "/month",
    badge: "Individual",
    features: ["15 active listings", "Residential + ✨ Commercial premises", "✨ Corporate stays (NGO/expat)", "Full owner analytics", "2 monthly boosts", "Verified owner badge"],
    notIncluded: ["Multi-agent team", "Full agency CRM", "White label"],
    current: false,
  },
];

const agencyPlans = [
  {
    name: "Starter",
    price: 2000,
    duration: "/month",
    badge: "Agency",
    features: ["3 agent accounts", "25 listings", "Agency-branded profile", "Lead assignment & inbox", "Basic CRM", "Bulk listing upload"],
    notIncluded: ["Commercial premises", "Corporate stays", "White label"],
    current: false,
  },
  {
    name: "Growth",
    price: 5000,
    duration: "/month",
    badge: "Agency",
    features: ["10 agent accounts", "100 listings", "✨ Commercial premises (shops/offices)", "Full CRM with pipelines", "Agent performance analytics", "5 monthly boosts", "Featured agency badge", "County heatmaps"],
    notIncluded: ["Corporate stays", "White label"],
    popular: true,
    current: false,
  },
  {
    name: "Enterprise",
    price: 10000,
    duration: "/month",
    badge: "Agency",
    features: ["Unlimited agents", "Unlimited listings", "✨ Commercial premises", "✨ Corporate stays (NGO/expat)", "Full CRM + lead routing", "White-label custom branding", "Dedicated account manager", "Priority support 24/7"],
    notIncluded: [],
    current: false,
  },
];

const stayHostPlans = [
  {
    name: "Basic",
    price: 1000,
    duration: "/month",
    features: ["2 stay listings", "Short stays only", "Basic calendar", "Guest chat", "Standard placement"],
    notIncluded: ["Corporate stays", "Smart pricing", "County heatmap"],
    current: false,
  },
  {
    name: "Pro",
    price: 2500,
    duration: "/month",
    features: ["10 stay listings", "Short stays only", "Full calendar sync", "Priority chat", "Featured stays", "Booking analytics", "2 monthly boosts"],
    notIncluded: ["Corporate stays", "Smart pricing"],
    popular: true,
    current: false,
  },
  {
    name: "Premium",
    price: 5000,
    duration: "/month",
    features: ["Unlimited listings", "✨ Corporate stays (NGO/expat)", "Smart pricing AI", "Priority support", "County heatmaps", "Booking analytics", "5 monthly boosts"],
    notIncluded: [],
    current: false,
  },
];

const serviceProviderPlans = [
  {
    name: "Basic",
    price: 500,
    duration: "/month",
    badge: "Individual",
    features: ["1 service listing", "5 bookings/month", "Basic profile", "Client messaging"],
    notIncluded: ["Portfolio gallery", "Priority placement"],
    current: false,
  },
  {
    name: "Pro",
    price: 1000,
    duration: "/month",
    badge: "Individual",
    features: ["3 service listings", "Unlimited bookings", "Priority chat", "Portfolio gallery", "Client reviews showcase"],
    notIncluded: ["Team members", "CRM tools"],
    popular: true,
    current: false,
  },
  {
    name: "Business Pro",
    price: 3000,
    duration: "/month",
    badge: "Business",
    features: ["10 service listings", "Team members", "CRM tools", "County analytics", "Featured profile", "Priority support"],
    notIncluded: ["Unlimited listings"],
    current: false,
  },
  {
    name: "Enterprise",
    price: 5000,
    duration: "/month",
    badge: "Business",
    features: ["Unlimited listings", "Unlimited team", "Full CRM", "County analytics", "Featured profile", "Priority support"],
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
  const { closing, triggerClose } = useOverlayClose(onBack);
  const role = currentRole || localStorage.getItem("kejasure_role") || "tenant";
  const { plans, label } = getPlansForRole(role);
  const [selectedPlan, setSelectedPlan] = useState(() => plans.findIndex(p => p.popular) ?? 1);
  const [showPayment, setShowPayment] = useState(false);

  const handleSubscriptionSuccess = async (plan: { name: string; price: number; duration: string }, transactionId: string) => {
    try {
      await import("@/integrations/supabase/actions").then(async ({ createSubscription, recordPayment }) => {
        await createSubscription({
          plan_id: null,
          plan_name: plan.name,
          role: role as any,
          price: plan.price,
          duration: plan.duration || "",
          auto_renew: false,
          currency: "KES",
          metadata: { transaction_id: transactionId, category: `${label} Subscription` },
        });
        await recordPayment({
          subscription_id: null,
          amount: plan.price,
          currency: "KES",
          method: "M-Pesa",
          status: "completed",
          transaction_id: transactionId,
          metadata: { plan: plan.name, category: `${label} Subscription` },
        });
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Subscription saved locally",
        description: "Payment succeeded, but saving the subscription to the server failed.",
        variant: "destructive",
      });
    }
  };

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
        onSuccess={handleSubscriptionSuccess}
      />
    );
  }

  return (
    <div className={`fixed inset-0 z-[60] bg-background overflow-y-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}>
      {/* Header */}
      <div className="gradient-premium px-4 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={triggerClose} className="p-1">
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

      <div className="px-4 -mt-4 pb-24">
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
                    ? "border-accent bg-accent/10 dark:bg-accent/20 card-shadow-hover ring-2 ring-accent/30"
                    : "border-accent/50 bg-accent/5 dark:bg-accent/10"
                  : selectedPlan === i
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent text-[9px] font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  ⭐ Best Value
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
                    {(plan as any).badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        (plan as any).badge === "Business" ? "bg-accent/15 text-accent-foreground" : "bg-primary/10 text-primary"
                      }`}>{(plan as any).badge}</span>
                    )}
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
        <button
          onClick={() => setShowPayment(true)}
          className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mb-3"
        >
          <Zap className="w-4 h-4" />
          {`Subscribe — KES ${plans[selectedPlan].price.toLocaleString()}${plans[selectedPlan].duration}`}
        </button>

        <p className="text-center text-[10px] text-muted-foreground">
          Paid via M-Pesa · Cancel anytime · No auto-renewal
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;

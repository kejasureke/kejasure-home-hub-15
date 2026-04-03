import { X, ShieldCheck, Zap, Star, Check, Crown } from "lucide-react";

interface PremiumUnlockModalProps {
  onClose: () => void;
}

const tiers = [
  {
    price: 50,
    duration: "24 hours",
    label: "Quick Look",
    popular: false,
    features: ["View 5 contacts", "Basic chat access"],
  },
  {
    price: 100,
    duration: "3 days",
    label: "Best Value",
    popular: true,
    features: ["Unlimited contacts", "Priority chat", "Verified badge boost"],
  },
  {
    price: 200,
    duration: "7 days",
    label: "Power User",
    popular: false,
    features: ["Unlimited everything", "Direct calls", "Priority support", "Featured profile"],
  },
];

const PremiumUnlockModal = ({ onClose }: PremiumUnlockModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full bg-card rounded-t-3xl p-6 pb-8 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl gradient-premium mx-auto flex items-center justify-center mb-3">
            <Crown className="w-7 h-7 text-accent-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Unlock Full Access</h2>
          <p className="text-sm text-muted-foreground">
            Connect directly with landlords. Verified contacts, instant chat, and faster responses.
          </p>
        </div>

        {/* Trust banner */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/15 mb-5">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">Keja Safi, Keja Sure.</span> All contacts verified. Pay securely via M-Pesa.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="space-y-3 mb-6">
          {tiers.map((tier) => (
            <button
              key={tier.price}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.98] relative ${
                tier.popular
                  ? "border-accent gradient-cream-gold card-shadow-hover"
                  : "border-border bg-card"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full gradient-premium text-[10px] font-bold text-accent-foreground uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className={`text-base font-bold ${tier.popular ? "text-accent-foreground" : "text-foreground"}`}>
                    KES {tier.price}
                  </h3>
                  <p className="text-xs text-muted-foreground">{tier.duration} access</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  tier.popular ? "gradient-premium text-accent-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                  {tier.label}
                </span>
              </div>
              <div className="space-y-1">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className={`w-3 h-3 ${tier.popular ? "text-accent" : "text-primary"}`} />
                    {f}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button className="w-full py-4 rounded-xl gradient-mpesa text-sm font-bold text-primary-foreground active:scale-[0.98] transition-transform mb-3">
          <Zap className="w-4 h-4 inline mr-1.5" />
          Pay with M-Pesa
        </button>
        <p className="text-center text-[10px] text-muted-foreground">
          Instant activation · No recurring charges · Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default PremiumUnlockModal;

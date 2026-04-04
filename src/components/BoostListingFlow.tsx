import { useState } from "react";
import { ArrowLeft, Zap, TrendingUp, Eye, Clock, Check, Star, Crown, Sparkles } from "lucide-react";
import MpesaPaymentFlow from "./MpesaPaymentFlow";

interface BoostListingFlowProps {
  onBack: () => void;
}

const boostPlans = [
  {
    name: "Spotlight",
    price: 200,
    duration: "3 days",
    features: ["Top of search results", "Highlighted border", "2x more views"],
  },
  {
    name: "Featured",
    price: 500,
    duration: "7 days",
    features: ["⭐ Featured badge", "Top of feed", "5x more views", "Priority in alerts"],
    popular: true,
  },
  {
    name: "Premium Boost",
    price: 1000,
    duration: "14 days",
    features: ["🏆 Premium badge", "Top of feed", "10x more views", "Push notification blast", "Social media feature"],
  },
];

const myListings = [
  { id: "1", title: "3BR Apartment, Kilimani", views: 847, status: "active" },
  { id: "2", title: "2BR Westlands Modern", views: 612, status: "active" },
  { id: "3", title: "Studio Apartment, Westlands", views: 1203, status: "active" },
];

const BoostListingFlow = ({ onBack }: BoostListingFlowProps) => {
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [selectedBoost, setSelectedBoost] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [step, setStep] = useState<"select-listing" | "select-boost">("select-listing");

  if (showPayment) {
    return (
      <MpesaPaymentFlow
        plans={boostPlans.map(p => ({ name: p.name, price: p.price, duration: p.duration, features: p.features }))}
        selectedPlanIndex={selectedBoost}
        category="Listing Boost"
        onClose={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-background overflow-y-auto animate-slide-up">
      <div className="px-4 pt-5 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={step === "select-boost" ? () => setStep("select-listing") : onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Boost Listing</h1>
            <p className="text-xs text-muted-foreground">
              {step === "select-listing" ? "Choose a listing to boost" : "Choose boost package"}
            </p>
          </div>
        </div>

        {step === "select-listing" ? (
          <>
            {/* Info banner */}
            <div className="p-4 rounded-2xl gradient-cream-gold border border-accent/20 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-accent" />
                <h3 className="text-sm font-bold text-accent-foreground">Get More Views</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Boosted listings get up to <span className="font-bold text-foreground">10x more views</span> and appear at the top of search results with a special badge.
              </p>
            </div>

            {/* Stats preview */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="p-3 rounded-xl bg-card card-shadow text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold text-foreground">10x</p>
                <p className="text-[10px] text-muted-foreground">More views</p>
              </div>
              <div className="p-3 rounded-xl bg-card card-shadow text-center">
                <Eye className="w-5 h-5 mx-auto mb-1 text-accent" />
                <p className="text-lg font-bold text-foreground">Top</p>
                <p className="text-[10px] text-muted-foreground">Of results</p>
              </div>
              <div className="p-3 rounded-xl bg-card card-shadow text-center">
                <Star className="w-5 h-5 mx-auto mb-1 text-gold" />
                <p className="text-lg font-bold text-foreground">⭐</p>
                <p className="text-[10px] text-muted-foreground">Featured badge</p>
              </div>
            </div>

            {/* Listing selection */}
            <h3 className="text-sm font-semibold mb-3">Select Listing</h3>
            <div className="space-y-2">
              {myListings.map((listing) => (
                <button
                  key={listing.id}
                  onClick={() => { setSelectedListing(listing.id); setStep("select-boost"); }}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                    selectedListing === listing.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl">🏠</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{listing.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {listing.views} views
                        </span>
                        <span className="text-xs text-primary font-medium capitalize">{listing.status}</span>
                      </div>
                    </div>
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Selected listing */}
            <div className="p-3 rounded-xl bg-secondary mb-5">
              <p className="text-xs text-muted-foreground">Boosting:</p>
              <p className="text-sm font-semibold text-foreground">
                {myListings.find(l => l.id === selectedListing)?.title}
              </p>
            </div>

            {/* Boost packages */}
            <div className="space-y-3 mb-6">
              {boostPlans.map((plan, i) => (
                <button
                  key={plan.name}
                  onClick={() => setSelectedBoost(i)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.98] relative ${
                    plan.popular
                      ? selectedBoost === i
                        ? "border-accent gradient-cream-gold card-shadow-hover ring-2 ring-accent/30"
                        : "border-accent/50 gradient-cream-gold"
                      : selectedBoost === i
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border bg-card"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full gradient-premium text-[9px] font-bold text-accent-foreground uppercase tracking-wider">
                      ⭐ Best Value
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selectedBoost === i
                          ? plan.popular ? "border-accent bg-accent" : "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      }`}>
                        {selectedBoost === i && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{plan.duration}</p>
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-foreground">KES {plan.price}</span>
                  </div>

                  <div className="space-y-1 ml-8">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-foreground">
                        <Check className="w-3 h-3 text-primary shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowPayment(true)}
              className="w-full py-4 rounded-xl gradient-premium text-sm font-bold text-accent-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mb-3"
            >
              <Zap className="w-4 h-4" />
              Boost for KES {boostPlans[selectedBoost].price}
            </button>
            <p className="text-center text-[10px] text-muted-foreground">
              One-time payment via M-Pesa · Starts immediately
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default BoostListingFlow;

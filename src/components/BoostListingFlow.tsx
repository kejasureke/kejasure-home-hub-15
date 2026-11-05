import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Zap, TrendingUp, Eye, Clock, Check, Star, Crown, Sparkles } from "lucide-react";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import MpesaPaymentFlow from "./MpesaPaymentFlow";

interface BoostListingFlowProps {
  onBack: () => void;
  role?: string;
}

type BoostKind = "silver" | "gold" | "hotdeal";

// Prices per provider type [silver, gold, hot deal] in KES
const BOOST_PRICES: Record<string, [number, number, number]> = {
  landlord: [100, 350, 200],
  agency: [200, 700, 400],
  stayhost: [150, 450, 250],
  serviceprovider: [80, 250, 150],
};

const roleCopy: Record<string, { item: string; badge: string; hot: string; hotDesc: string }> = {
  landlord: { item: "listing", badge: "Featured Property", hot: "Neighborhood Hot Deal", hotDesc: "Urgent vacancy or rent drop" },
  agency: { item: "listing", badge: "Featured Agency Listing", hot: "Neighborhood Hot Deal", hotDesc: "Urgent vacancies or rent drops" },
  stayhost: { item: "stay", badge: "Featured Stay", hot: "Neighborhood Hot Deal", hotDesc: "Last-minute dates or price drops" },
  serviceprovider: { item: "service", badge: "Featured Service", hot: "Neighborhood Hot Offer", hotDesc: "Discounts or same-day availability" },
};

const getBoostPlans = (role: string) => {
  const r = BOOST_PRICES[role] ? role : "landlord";
  const [silver, gold, hot] = BOOST_PRICES[r];
  const c = roleCopy[r];
  return [
    {
      kind: "silver" as BoostKind,
      name: "Silver Boost",
      price: silver,
      duration: "3 days",
      features: [`Pushes your ${c.item} back to the top of search results`, "Fresh \"Just bumped\" position", "More views in your area"],
    },
    {
      kind: "gold" as BoostKind,
      name: "Gold Featured Slot",
      price: gold,
      duration: "7 days",
      features: ["Pinned in the featured slot of search results", `"${c.badge}" highlighted badge`, "Gold border on your card"],
      popular: true,
    },
    {
      kind: "hotdeal" as BoostKind,
      name: c.hot,
      price: hot,
      duration: "5 days",
      features: [`Highlighted card for ${c.hotDesc.toLowerCase()}`, "Shown to people searching your target neighborhood", "🔥 Hot deal tag"],
    },
  ];
};

interface MyListing { id: string; title: string; views: number; status: string }

const BoostListingFlow = ({ onBack, role = "landlord" }: BoostListingFlowProps) => {
  const boostPlans = getBoostPlans(role);
  const itemWord = (roleCopy[role] ?? roleCopy.landlord).item;
  const { closing, triggerClose } = useOverlayClose(onBack);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [selectedBoost, setSelectedBoost] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [step, setStep] = useState<"select-listing" | "select-boost">("select-listing");
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("listings")
        .select("id, title, view_count, status")
        .eq("owner_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setMyListings((data ?? []).map((l) => ({ id: l.id, title: l.title, views: l.view_count, status: l.status })));
      setLoading(false);
    })();
  }, []);

  if (showPayment && selectedListing) {
    return (
      <MpesaPaymentFlow
        plans={boostPlans.map(p => ({ name: p.name, price: p.price, duration: p.duration, features: p.features }))}
        selectedPlanIndex={selectedBoost}
        category={`${boostPlans[selectedBoost].name} Boost`}
        kind="boost"
        listingId={selectedListing}
        onClose={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className={`fixed inset-0 z-[60] bg-background overflow-y-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}>
      <div className="px-4 pt-safe pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={step === "select-boost" ? () => setStep("select-listing") : triggerClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold capitalize">Boost your {itemWord}</h1>
            <p className="text-xs text-muted-foreground">
              {step === "select-listing" ? `Choose a ${itemWord} to boost` : "Choose a boost"}
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
                Pick from 3 boosts: <span className="font-bold text-foreground">Silver</span> bumps you back to the top, <span className="font-bold text-foreground">Gold</span> pins you in the featured slot with a badge, and <span className="font-bold text-foreground">Hot Deal</span> highlights urgent offers in your target area.
              </p>
            </div>

            {/* Stats preview */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="p-3 rounded-xl bg-card card-shadow text-center">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-sm font-bold text-foreground">Silver</p>
                <p className="text-[10px] text-muted-foreground">Back to top</p>
              </div>
              <div className="p-3 rounded-xl bg-card card-shadow text-center">
                <Crown className="w-5 h-5 mx-auto mb-1 text-gold" />
                <p className="text-sm font-bold text-foreground">Gold</p>
                <p className="text-[10px] text-muted-foreground">Pinned + badge</p>
              </div>
              <div className="p-3 rounded-xl bg-card card-shadow text-center">
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-destructive" />
                <p className="text-sm font-bold text-foreground">Hot Deal</p>
                <p className="text-[10px] text-muted-foreground">Area highlight</p>
              </div>
            </div>

            {/* Listing selection */}
            <h3 className="text-sm font-semibold mb-3">Select Listing</h3>
            <div className="space-y-2">
              {loading && <p className="text-xs text-muted-foreground">Loading your listings…</p>}
              {!loading && myListings.length === 0 && (
                <p className="text-xs text-muted-foreground p-4 rounded-2xl bg-card text-center">{`You have no active ${itemWord}s to boost yet. Publish one first.`}</p>
              )}
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
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent text-[9px] font-bold text-white uppercase tracking-wider">
                      ⭐ Most popular
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
                        <h3 className="text-base font-bold text-foreground">{plan.kind === "silver" ? "🥈 " : plan.kind === "gold" ? "🥇 " : "🔥 "}{plan.name}</h3>
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

import { useState } from "react";
import { X, ShieldCheck, Zap, Check, Crown, MapPin, Phone, MessageCircle, Wrench, CalendarCheck, Heart, SlidersHorizontal, Star, Bell, CheckCircle2, Receipt, Clock } from "lucide-react";

interface PremiumUnlockModalProps {
  onClose: () => void;
}

type ModalState = "select" | "processing" | "success";

const tiers = [
  {
    price: 50,
    duration: "24 Hours",
    label: "Quick Look",
    popular: false,
  },
  {
    price: 100,
    duration: "3 Days",
    label: "Best Value",
    popular: true,
  },
  {
    price: 200,
    duration: "7 Days",
    label: "Power User",
    popular: false,
  },
];

const benefits = [
  { icon: MapPin, text: "Exact map pin location" },
  { icon: Phone, text: "Full landlord phone number" },
  { icon: MessageCircle, text: "In-app chat access" },
  { icon: Wrench, text: "Direct service provider contact" },
  { icon: CalendarCheck, text: "Short stay booking confirmation" },
  { icon: Heart, text: "Unlimited favorites" },
  { icon: SlidersHorizontal, text: "Advanced filters" },
  { icon: Star, text: "Verified featured listings first" },
  { icon: Bell, text: "Priority county alerts" },
];

const PremiumUnlockModal = ({ onClose }: PremiumUnlockModalProps) => {
  const [selected, setSelected] = useState(1); // default Best Value
  const [state, setState] = useState<ModalState>("select");
  const [phoneInput, setPhoneInput] = useState("");

  const handlePay = () => {
    if (!phoneInput || phoneInput.length < 9) return;
    setState("processing");
    // Simulate STK push
    setTimeout(() => setState("success"), 3000);
  };

  // Success state
  if (state === "success") {
    const tier = tiers[selected];
    const now = new Date();
    const expiry = new Date(now);
    if (selected === 0) expiry.setHours(expiry.getHours() + 24);
    else if (selected === 1) expiry.setDate(expiry.getDate() + 3);
    else expiry.setDate(expiry.getDate() + 7);

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-[90%] max-w-sm bg-card rounded-3xl p-6 animate-scale-in">
          {/* Success animation */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-[pulse_1s_ease-in-out_2]">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground mb-1">Payment Successful!</h2>
            <p className="text-sm text-muted-foreground">Your access is now active</p>
          </div>

          {/* Digital receipt */}
          <div className="bg-secondary/50 rounded-2xl p-4 mb-5 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Digital Receipt</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-semibold text-foreground">{tier.label} — {tier.duration}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold text-foreground">KES {tier.price}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Payment</span>
              <span className="font-semibold text-primary">M-Pesa</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-semibold text-foreground">KS{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-xs">
              <span className="text-muted-foreground">Expires</span>
              <span className="font-semibold text-foreground">{expiry.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>

          {/* Renewal reminder */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent/20 mb-5">
            <Clock className="w-4 h-4 text-accent shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              We'll remind you <span className="font-semibold text-accent-foreground">before your access expires</span> so you never miss a lead.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform"
          >
            Start Browsing
          </button>
        </div>
      </div>
    );
  }

  // Processing state
  if (state === "processing") {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-[85%] max-w-xs bg-card rounded-3xl p-8 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "hsl(var(--mpesa-green))" }}>
            <Phone className="w-7 h-7 text-white animate-[pulse_1.2s_ease-in-out_infinite]" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Check your phone</h3>
          <p className="text-sm text-muted-foreground mb-1">
            An M-Pesa STK push has been sent to
          </p>
          <p className="text-sm font-bold text-foreground mb-4">+254 {phoneInput}</p>
          <p className="text-xs text-muted-foreground">Enter your M-Pesa PIN to complete payment</p>
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_infinite]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_infinite_0.2s]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_infinite_0.4s]" />
          </div>
        </div>
      </div>
    );
  }

  // Selection state
  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full bg-card rounded-t-3xl p-5 pb-6 animate-slide-up max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl gradient-premium mx-auto flex items-center justify-center mb-3">
            <Crown className="w-7 h-7 text-accent-foreground" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-1">Unlock Full Access</h2>
          <p className="text-xs text-muted-foreground">
            Connect directly with verified landlords, hosts & providers
          </p>
        </div>

        {/* Trust banner */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/15 mb-4">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-primary">Keja Safi, Keja Sure.</span> Verified contacts. Secure M-Pesa.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="space-y-2.5 mb-4">
          {tiers.map((tier, i) => (
            <button
              key={tier.price}
              onClick={() => setSelected(i)}
              className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all active:scale-[0.98] relative ${
                tier.popular
                  ? selected === i
                    ? "border-accent gradient-cream-gold card-shadow-hover ring-2 ring-accent/30"
                    : "border-accent/50 gradient-cream-gold"
                  : selected === i
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent text-[9px] font-bold text-white uppercase tracking-wider">
                  ⭐ Best Value
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected === i
                      ? tier.popular ? "border-accent bg-accent" : "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  }`}>
                    {selected === i && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold ${tier.popular ? "text-accent-foreground" : "text-foreground"}`}>
                      KES {tier.price}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{tier.duration} access</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  tier.popular ? "gradient-premium text-accent-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                  {tier.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Benefits grid */}
        <div className="mb-4">
          <h4 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">What you get</h4>
          <div className="grid grid-cols-1 gap-1.5">
            {benefits.map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-xs text-muted-foreground">
                <b.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* M-Pesa phone input */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-foreground mb-1.5 block">M-Pesa Number</label>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
            <span className="text-xs font-semibold text-muted-foreground shrink-0">🇰🇪 +254</span>
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 9))}
              placeholder="7XX XXX XXX"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              maxLength={9}
            />
          </div>
        </div>

        {/* M-Pesa CTA */}
        <button
          onClick={handlePay}
          disabled={phoneInput.length < 9}
          className="w-full py-4 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-all mb-2 disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2"
          style={{ background: phoneInput.length >= 9 ? "hsl(var(--mpesa-green))" : undefined }}
        >
          <Zap className="w-4 h-4" />
          Pay KES {tiers[selected].price} with M-Pesa
        </button>
        <p className="text-center text-[10px] text-muted-foreground">
          Instant activation · No recurring charges · Safaricom M-Pesa
        </p>
      </div>
    </div>
  );
};

export default PremiumUnlockModal;
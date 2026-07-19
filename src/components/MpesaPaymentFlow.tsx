import { useState, useEffect } from "react";
import {
  Phone, CheckCircle2, XCircle, Clock, Receipt, RefreshCw, Zap,
  ShieldCheck, AlertTriangle, ArrowLeft, X
} from "lucide-react";
import { useHardwareBack } from "@/hooks/useHardwareBack";

export interface MpesaPlan {
  name: string;
  price: number;
  duration: string;
  features?: string[];
  popular?: boolean;
}

interface MpesaPaymentFlowProps {
  plans: MpesaPlan[];
  selectedPlanIndex?: number;
  category: string; // e.g. "Tenant Unlock", "Landlord Plan", "Agency Plan"
  onClose: () => void;
  onSuccess?: (plan: MpesaPlan, transactionId: string) => void;
  accentColor?: string; // tailwind color class for the category
}

type PaymentState = "select" | "confirm" | "processing" | "success" | "failed";

const MpesaPaymentFlow = ({
  plans,
  selectedPlanIndex = 0,
  category,
  onClose,
  onSuccess,
  accentColor = "primary",
}: MpesaPaymentFlowProps) => {
  const [selected, setSelected] = useState(selectedPlanIndex);
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<PaymentState>("select");
  const [countdown, setCountdown] = useState(30);
  const [transactionId, setTransactionId] = useState("");

  // Countdown timer during processing
  useEffect(() => {
    if (state !== "processing") return;
    if (countdown <= 0) {
      // Simulate 85% success rate
      if (Math.random() > 0.15) {
        const txId = "KS" + Math.random().toString(36).substring(2, 10).toUpperCase();
        setTransactionId(txId);
        setState("success");
        onSuccess?.(plans[selected], txId);
      } else {
        setState("failed");
      }
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [state, countdown]);

  const plan = plans[selected];

  const handlePay = () => {
    if (phone.length < 9) return;
    setState("confirm");
  };

  const handleConfirmPay = () => {
    setCountdown(4); // Simulate quick STK push
    setState("processing");
  };

  const handleRetry = () => {
    setCountdown(4);
    setState("processing");
  };

  // ====== SUCCESS STATE ======
  if (state === "success") {
    const now = new Date();
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={onClose}>
        <div className="w-[90%] max-w-sm bg-card rounded-3xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center mb-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3 animate-[pulse_1s_ease-in-out_2]">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground mb-1">Payment Successful!</h2>
            <p className="text-sm text-muted-foreground">{category} activated</p>
          </div>

          {/* Digital Receipt */}
          <div className="bg-secondary/50 rounded-2xl p-4 mb-4 space-y-2.5">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Digital Receipt</span>
            </div>
            {[
              { label: "Category", value: category },
              { label: "Plan", value: `${plan.name} — ${plan.duration}` },
              { label: "Amount", value: `KES ${plan.price.toLocaleString()}` },
              { label: "Payment", value: "M-Pesa", highlight: true },
              { label: "Phone", value: `+254 ${phone}` },
              { label: "Transaction ID", value: transactionId },
              { label: "Date", value: now.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className={`font-semibold ${r.highlight ? "text-primary" : "text-foreground"}`}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Renewal Reminder */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-accent/10 border border-accent/20 mb-4">
            <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              We'll send a reminder <span className="font-semibold text-accent-foreground">before expiry</span> via SMS
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ====== FAILED STATE ======
  if (state === "failed") {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={onClose}>
        <div className="w-[90%] max-w-sm bg-card rounded-3xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center mb-5">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-xl font-extrabold text-foreground mb-1">Payment Failed</h2>
            <p className="text-sm text-muted-foreground text-center">
              The M-Pesa transaction was not completed. This could be due to insufficient funds, timeout, or wrong PIN.
            </p>
          </div>

          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs font-bold text-destructive">Common reasons</span>
            </div>
            <ul className="space-y-1 text-[11px] text-muted-foreground ml-5 list-disc">
              <li>Insufficient M-Pesa balance</li>
              <li>Request timed out — try again</li>
              <li>Wrong M-Pesa PIN entered</li>
              <li>Daily transaction limit reached</li>
            </ul>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleRetry}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              style={{ background: "hsl(var(--mpesa-green))" }}
            >
              <RefreshCw className="w-4 h-4" /> Retry Payment
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====== PROCESSING STATE ======
  if (state === "processing") {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
        <div className="w-[85%] max-w-xs bg-card rounded-3xl p-8 text-center animate-scale-in">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: "hsl(var(--mpesa-green))" }}
          >
            <Phone className="w-7 h-7 text-white animate-[pulse_1.2s_ease-in-out_infinite]" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Check your phone</h3>
          <p className="text-sm text-muted-foreground mb-1">
            M-Pesa STK push sent to
          </p>
          <p className="text-sm font-bold text-foreground mb-1">+254 {phone}</p>
          <p className="text-xs text-muted-foreground mb-4">Enter your M-Pesa PIN to complete</p>

          {/* Amount */}
          <div className="bg-secondary/50 rounded-xl p-3 mb-4">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-2xl font-extrabold text-foreground">KES {plan.price.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{category} — {plan.name}</p>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Waiting... {countdown}s</span>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_infinite]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_infinite]" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-[pulse_1s_ease-in-out_infinite]" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    );
  }

  // ====== CONFIRM STATE ======
  if (state === "confirm") {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={() => setState("select")}>
        <div className="w-[90%] max-w-sm bg-card rounded-3xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-foreground text-center mb-4">Confirm Payment</h3>

          <div className="bg-secondary/50 rounded-2xl p-4 mb-4 space-y-2.5">
            {[
              { label: "Plan", value: `${plan.name} — ${plan.duration}` },
              { label: "Amount", value: `KES ${plan.price.toLocaleString()}` },
              { label: "M-Pesa Number", value: `+254 ${phone}` },
              { label: "Category", value: category },
            ].map((r) => (
              <div key={r.label} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-semibold text-foreground">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/15 mb-4">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              You'll receive an <span className="font-semibold text-primary">M-Pesa STK push</span> on your phone. Enter your PIN to confirm.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleConfirmPay}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              style={{ background: "hsl(var(--mpesa-green))" }}
            >
              <Zap className="w-4 h-4" /> Confirm & Pay KES {plan.price.toLocaleString()}
            </button>
            <button
              onClick={() => setState("select")}
              className="w-full py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====== SELECT STATE ======
  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full bg-card rounded-t-3xl p-5 pb-6 animate-slide-up max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-1 bg-muted rounded-full mx-auto" />
        </div>

        <div className="text-center mb-4">
          <h2 className="text-lg font-extrabold text-foreground mb-1">{category}</h2>
          <p className="text-xs text-muted-foreground">Select a plan and pay via M-Pesa</p>
        </div>

        {/* Plan Selection */}
        <div className="space-y-2 mb-4">
          {plans.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setSelected(i)}
              className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all active:scale-[0.98] relative ${
                p.popular
                  ? selected === i
                    ? "border-accent gradient-cream-gold ring-2 ring-accent/30"
                    : "border-accent/50 gradient-cream-gold"
                  : selected === i
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card"
              }`}
            >
              {p.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-accent text-[9px] font-bold text-white uppercase tracking-wider">
                  ⭐ Best Value
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected === i
                      ? p.popular ? "border-accent bg-accent" : "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  }`}>
                    {selected === i && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground">{p.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{p.duration}</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-primary">KES {p.price.toLocaleString()}</span>
              </div>
              {p.features && p.features.length > 0 && (
                <div className="mt-2 ml-8 space-y-0.5">
                  {p.features.map((f) => (
                    <p key={f} className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-primary shrink-0" /> {f}
                    </p>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Phone Input */}
        <div className="mb-4">
          <label className="text-[11px] font-semibold text-foreground mb-1.5 block">M-Pesa Number</label>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
            <span className="text-xs font-semibold text-muted-foreground shrink-0">🇰🇪 +254</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
              placeholder="7XX XXX XXX"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              maxLength={9}
            />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handlePay}
          disabled={phone.length < 9}
          className="w-full py-4 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-all mb-2 disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ background: phone.length >= 9 ? "hsl(var(--mpesa-green))" : undefined }}
        >
          <Zap className="w-4 h-4" />
          Pay KES {plan.price.toLocaleString()} with M-Pesa
        </button>
        <p className="text-center text-[10px] text-muted-foreground">
          Instant activation · Secure M-Pesa · Safaricom
        </p>
      </div>
    </div>
  );
};

export default MpesaPaymentFlow;
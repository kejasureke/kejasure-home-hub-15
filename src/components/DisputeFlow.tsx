import { useState } from "react";
import {
  ArrowLeft, MessageCircle, Send, CheckCircle2, Clock, AlertTriangle,
  ShieldCheck, ChevronRight, FileText, Scale, X
} from "lucide-react";
import { useOverlayClose } from "@/hooks/useOverlayClose";

interface DisputeFlowProps {
  onClose: () => void;
}

type DisputeStep = "select" | "details" | "submitted" | "track";

const disputeCategories = [
  { id: "listing-mismatch", label: "Listing doesn't match reality", desc: "Photos, price, or amenities differ from what was shown" },
  { id: "refund", label: "Refund request", desc: "Want a refund for a short stay or service" },
  { id: "no-response", label: "Landlord not responding", desc: "Paid to unlock but can't reach the landlord" },
  { id: "service-issue", label: "Service not delivered", desc: "Booked a service that wasn't completed" },
  { id: "safety", label: "Safety concern", desc: "Feel unsafe about a property or interaction" },
  { id: "billing", label: "Billing issue", desc: "Double charge, wrong amount, or missing receipt" },
];

const existingDisputes = [
  { id: "D-015", category: "Listing mismatch", target: "3BR Kilimani", status: "investigating", date: "2 days ago", lastUpdate: "Admin is reviewing photos" },
  { id: "D-013", category: "Refund request", target: "Beach View Nyali", status: "resolved", date: "1 week ago", lastUpdate: "Refund of KES 6,500 processed" },
];

const DisputeFlow = ({ onClose }: DisputeFlowProps) => {
  const { closing, triggerClose } = useOverlayClose(onClose);
  const [step, setStep] = useState<DisputeStep>("select");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [propertyName, setPropertyName] = useState("");

  const handleSubmit = () => setStep("submitted");

  // Submitted
  if (step === "submitted") {
    return (
      <div className="fixed inset-0 z-[60] bg-background overflow-y-auto animate-slide-up">
        <div className="px-4 pt-6 pb-8 flex flex-col items-center text-center min-h-screen justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-[pulse_1s_ease-in-out_2]">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2">Dispute Filed</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs">
            Our team will review your dispute and respond within 48 hours. You'll receive updates via SMS and in-app notifications.
          </p>

          <div className="w-full bg-card rounded-2xl card-shadow p-4 mb-5 text-left">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Dispute ID</span>
                <span className="font-bold text-foreground">D-{Math.floor(Math.random() * 900 + 100)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold text-foreground">{disputeCategories.find(c => c.id === selectedCategory)?.label}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-accent">Under Review</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Expected Response</span>
                <span className="font-semibold text-foreground">Within 48 hours</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-trust/5 border border-trust/15 w-full mb-5">
            <ShieldCheck className="w-4 h-4 text-trust shrink-0" />
            <p className="text-[11px] text-muted-foreground text-left">
              <span className="font-semibold text-trust">Your safety matters.</span> If this is urgent, our team will prioritize your case.
            </p>
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={() => setStep("track")}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform"
            >
              Track My Disputes
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Track existing disputes
  if (step === "track") {
    return (
      <div className="fixed inset-0 z-[60] bg-background overflow-y-auto animate-slide-up">
        <div className="px-4 pt-5 pb-8">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={onClose} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
            <h1 className="text-lg font-bold">My Disputes</h1>
          </div>

          {existingDisputes.length > 0 ? (
            <div className="space-y-3">
              {existingDisputes.map((d) => (
                <div key={d.id} className="bg-card rounded-2xl card-shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground">{d.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      d.status === "investigating" ? "bg-accent/10 text-accent-foreground" :
                      d.status === "resolved" ? "bg-trust/10 text-trust" :
                      "bg-destructive/10 text-destructive"
                    }`}>{d.status}</span>
                  </div>
                  <p className="text-sm font-semibold mb-1">{d.category}</p>
                  <p className="text-xs text-muted-foreground mb-2">Re: {d.target} · Filed {d.date}</p>

                  {/* Timeline */}
                  <div className="border-l-2 border-primary/20 pl-3 ml-1 space-y-2">
                    <div className="relative">
                      <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                      <p className="text-[11px] text-foreground font-medium">{d.lastUpdate}</p>
                      <p className="text-[10px] text-muted-foreground">Latest update</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                      <p className="text-[11px] text-muted-foreground">Dispute filed</p>
                      <p className="text-[10px] text-muted-foreground">{d.date}</p>
                    </div>
                  </div>

                  {d.status !== "resolved" && (
                    <button className="w-full mt-3 py-2 rounded-lg bg-secondary text-xs font-semibold text-foreground flex items-center justify-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5" /> Send Message to Support
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Scale className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">No disputes</p>
              <p className="text-xs text-muted-foreground">All clear! You have no open disputes.</p>
            </div>
          )}

          <button
            onClick={() => { setStep("select"); setSelectedCategory(null); setDescription(""); }}
            className="w-full mt-5 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform"
          >
            File New Dispute
          </button>
        </div>
      </div>
    );
  }

  // Main flow: select + details
  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto animate-slide-up">
      <div className="px-4 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={step === "details" ? () => setStep("select") : onClose} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold">
            {step === "select" ? "File a Dispute" : "Dispute Details"}
          </h1>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-5">
          <div className={`flex-1 h-1 rounded-full ${step === "select" || step === "details" ? "bg-primary" : "bg-muted"}`} />
          <div className={`flex-1 h-1 rounded-full ${step === "details" ? "bg-primary" : "bg-muted"}`} />
        </div>

        {step === "select" && (
          <>
            <p className="text-sm text-muted-foreground mb-4">What's the issue?</p>
            <div className="space-y-2 mb-5">
              {disputeCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-[0.98] text-left ${
                    selectedCategory === c.id ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${selectedCategory === c.id ? "bg-primary" : "bg-muted-foreground/30"}`} />
                  <div>
                    <p className="text-sm font-semibold">{c.label}</p>
                    <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Track existing */}
            <button
              onClick={() => setStep("track")}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary mb-4"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground flex-1 text-left">Track existing disputes</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            <button
              onClick={() => selectedCategory && setStep("details")}
              disabled={!selectedCategory}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-40"
            >
              Continue
            </button>
          </>
        )}

        {step === "details" && (
          <>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/15 mb-4">
              <Scale className="w-4 h-4 text-primary shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Issue: <span className="font-semibold text-foreground">{disputeCategories.find(c => c.id === selectedCategory)?.label}</span>
              </p>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Property / Service name</label>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="e.g. 3BR Kilimani Apartment"
                className="w-full p-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Describe what happened</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us what went wrong. Include dates, names, and any details that help us investigate..."
                className="w-full h-28 p-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                maxLength={1000}
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{description.length}/1000</p>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/5 border border-accent/15 mb-5">
              <Clock className="w-4 h-4 text-accent shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                We'll respond within <span className="font-semibold text-accent-foreground">48 hours</span>. Urgent safety concerns are prioritized.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!description.trim() || !propertyName.trim()}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit Dispute
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DisputeFlow;
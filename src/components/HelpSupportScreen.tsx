import { useState } from "react";
import { ArrowLeft, HelpCircle, MessageCircle, ChevronDown, ChevronUp, Send, Star, Phone, Mail, ExternalLink } from "lucide-react";
import { useOverlayClose } from "@/hooks/useOverlayClose";

interface HelpSupportScreenProps {
  onBack: () => void;
}

type Tab = "faq" | "contact" | "feedback";

const faqs = [
  // Categories
  { q: "What categories can I browse on KejaSure?", a: "KejaSure covers six segments: Rentals (long-term homes), Short Stays (nightly Airbnb-style bookings), Corporate Stays (furnished homes for expats, NGOs and professionals), Business Spaces (shops, offices, godowns and showrooms), and Services (movers, cleaners, electricians, plumbers and other home pros). Use the filter button to switch between them." },
  { q: "What's the difference between Short Stays and Corporate Stays?", a: "Short Stays are nightly bookings (1+ nights) ideal for tourists and weekend getaways. Corporate Stays are premium furnished rentals for monthly/extended stays, tailored for expats, NGO staff and corporate professionals — usually with workspace, fast Wi-Fi and concierge support." },
  { q: "How do Business Spaces work?", a: "Business Spaces (Commercial) covers shops, offices, godowns and showrooms. You can filter by square footage, loading bay access, parking and zoning. Booking and contact-unlock works the same as residential rentals." },
  { q: "How do I book a service provider?", a: "Open the Services category, pick a service type (e.g. Movers, Cleaners, Plumbers), choose a verified provider, and tap Book. You'll select a date/time and the provider will confirm — contact details unlock once they accept." },

  // Account & contact
  { q: "How do I get a landlord's or host's contact?", a: "Subscribe to a plan, then send a booking request on the listing. Once the landlord, host or service provider accepts, their phone and chat are unlocked automatically inside the app." },
  { q: "Is KejaSure free to use?", a: "Browsing all listings is completely free. A subscription is required to send booking requests. Landlord and provider contacts only unlock after your booking is accepted." },
  { q: "What subscription plans are available?", a: "Tenants can choose KES 50 (24 hours), KES 100 (3 days) or KES 250 (7 days). Landlords, agencies, stay hosts and service providers have their own monthly plans with listing limits and boost credits." },

  // Verification & trust
  { q: "How does identity verification (KYC) work?", a: "Go to Profile → Verification. Tier 1 is phone (OTP), Tier 2 is National ID + selfie via Smile ID, and Tier 3 is Business verification (KRA PIN + business permit) for agencies and providers. Most checks complete in under a minute." },
  { q: "What do the verification badges mean?", a: "Blue = Phone Verified (Tenant), Green = ID Verified (Individual landlord/host), and Gold = Business Verified (Agency or registered service provider). Always look for at least a green badge before booking." },
  { q: "How do I spot a scam listing?", a: "Each listing shows a Scam Risk score based on verification, pricing and host activity. Avoid listings with 'Unverified' badges, prices far below market, or hosts pushing you to pay outside the app. Never send rent or deposit via M-Pesa to an individual." },

  // Listings & hosts
  { q: "Can I list my property on KejaSure?", a: "Yes. Choose the Landlord, Agency or Stay Host role at signup, complete verification, then use the 5-step listing wizard (Details → Location → Amenities → Media → Review) to publish." },
  { q: "How do I boost my listing for more views?", a: "From your dashboard, open any active listing and tap Boost. Pick a duration, pay via M-Pesa, and your listing gets a premium ribbon plus priority placement in the feed and map." },
  { q: "Can I edit or pause a listing?", a: "Yes — open your dashboard, tap the listing, then choose Edit, Pause or Delete. Paused listings stop receiving booking requests but stay saved for later." },

  // Payments & safety
  { q: "How do M-Pesa payments work?", a: "We send an STK push to your phone. Enter your M-Pesa PIN to confirm — payments process instantly and you get a digital receipt in the app. KejaSure only handles platform fees, subscriptions and service bookings." },
  { q: "Can I pay rent or deposit through KejaSure?", a: "No. To protect both sides, KejaSure does not handle rent or deposit transfers between tenants and landlords. Always pay these directly to the landlord after viewing and signing the lease." },
  { q: "How do I report a fake listing or bad host?", a: "Tap the flag icon on any listing or chat. Pick a reason, add details and submit — our trust team reviews all reports within 24 hours and may suspend the account." },
  { q: "What happens if I'm scammed?", a: "Open Profile → Disputes & Safety, file a dispute and upload evidence (screenshots, receipts). Our team investigates within 48 hours and works with authorities for confirmed fraud cases." },
  { q: "Can I get a refund?", a: "Subscription and platform fees are refundable for verified scam or service-failure cases. File a dispute through the app and the team will review within 48 hours." },

  // App features
  { q: "How do price drop alerts work?", a: "Save any listing as a favourite or tap the bell icon to track its price. You'll get an in-app notification (and SMS) the moment the host lowers the rent or nightly rate." },
  { q: "How do I compare two properties?", a: "Open any listing, tap Compare, then pick a second property. You'll see a side-by-side breakdown of price, size, amenities and a colour-coded winner." },
  { q: "Can I switch roles (e.g. tenant to landlord)?", a: "Yes. Open Profile and tap the Role Switcher to move between Tenant, Landlord, Agency, Stay Host and Service Provider modes. Each role has its own dashboard and tools." },
  { q: "How do notifications work?", a: "KejaSure sends in-app and SMS notifications for new messages, booking updates, price drops and verification status. Manage them under Settings → Notifications." },
];

const HelpSupportScreen = ({ onBack }: HelpSupportScreenProps) => {
  const { closing, triggerClose } = useOverlayClose(onBack);
  const [tab, setTab] = useState<Tab>("faq");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const tabs = [
    { key: "faq" as Tab, label: "FAQs", icon: HelpCircle },
    { key: "contact" as Tab, label: "Contact", icon: Phone },
    { key: "feedback" as Tab, label: "Feedback", icon: Star },
  ];

  return (
    <div className={`fixed inset-0 z-[60] bg-background overflow-y-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}>
      <div className="sticky top-0 z-10 glass-surface border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={triggerClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-base font-bold">Help & Support</h1>
        </div>
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t.key ? "bg-card card-shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 pb-20">
        {/* FAQs */}
        {tab === "faq" && (
          <div className="space-y-2 animate-fade-in">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card rounded-2xl card-shadow overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                  <span className="flex-1 text-sm font-semibold">{faq.q}</span>
                  {expandedFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-4 pt-0 animate-fade-in">
                    <p className="text-xs text-muted-foreground leading-relaxed pl-7">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contact */}
        {tab === "contact" && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-muted-foreground mb-4">Reach our support team through any of these channels:</p>

            {[
              { icon: MessageCircle, label: "Live Chat", desc: "Chat with our support team", detail: "Available 8AM - 10PM EAT", color: "text-primary" },
              { icon: Phone, label: "Call Us", desc: "+254 700 KEJASURE", detail: "Mon-Sat, 8AM - 6PM EAT", color: "text-primary" },
              { icon: Mail, label: "Email Support", desc: "support@kejasure.co.ke", detail: "Response within 24 hours", color: "text-primary" },
            ].map((ch) => (
              <button key={ch.label} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ch.icon className={`w-5 h-5 ${ch.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">{ch.label}</p>
                  <p className="text-xs text-muted-foreground">{ch.desc}</p>
                  <p className="text-[10px] text-muted-foreground">{ch.detail}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 mt-4">
              <p className="text-[11px] text-muted-foreground">
                🚨 For <span className="font-semibold text-primary">urgent safety concerns</span>, use the Disputes & Safety feature in your Profile for faster resolution.
              </p>
            </div>
          </div>
        )}

        {/* Feedback */}
        {tab === "feedback" && (
          <div className="animate-fade-in">
            {feedbackSent ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh]">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-primary fill-primary" />
                </div>
                <h3 className="text-lg font-bold mb-1">Thank You! 🎉</h3>
                <p className="text-sm text-muted-foreground text-center max-w-[260px]">
                  Your feedback helps us make KejaSure better for everyone in Kenya.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center">
                  <h3 className="text-base font-bold mb-1">Rate Your Experience</h3>
                  <p className="text-sm text-muted-foreground">How are you finding KejaSure?</p>
                </div>

                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setFeedbackRating(s)} className="active:scale-90 transition-transform">
                      <Star className={`w-10 h-10 ${s <= feedbackRating ? "text-accent fill-accent" : "text-muted-foreground/30"}`} />
                    </button>
                  ))}
                </div>
                {feedbackRating > 0 && (
                  <p className="text-center text-xs font-medium text-accent-foreground">
                    {feedbackRating <= 2 ? "We'll work to improve!" : feedbackRating <= 3 ? "Thanks for the honest feedback" : feedbackRating <= 4 ? "Glad you're enjoying it!" : "Awesome! 🎉"}
                  </p>
                )}

                <div>
                  <label className="text-xs font-semibold mb-1.5 block">Tell us more (optional)</label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="What do you love? What could be better?"
                    className="w-full h-28 p-3 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <button
                  onClick={() => feedbackRating > 0 && setFeedbackSent(true)}
                  disabled={feedbackRating === 0}
                  className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpSupportScreen;
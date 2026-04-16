import { useState } from "react";
import {
  ArrowLeft, Eye, Users, MessageCircle, TrendingUp, Zap, Plus,
  Calendar, BarChart3, RefreshCw, MapPin, ChevronRight,
  Star, Clock, CheckCircle2, Wrench, Camera, Shield, Award, User, Building2
} from "lucide-react";
import MpesaPaymentFlow from "./MpesaPaymentFlow";
import ListingCRUD from "./ListingCRUD";

interface ServiceProviderDashboardProps {
  onBack: () => void;
}

const individualPlans = [
  { name: "Basic", price: 500, features: ["1 service listing", "5 bookings/mo", "Basic profile"], current: false },
  { name: "Pro", price: 1000, features: ["3 service listings", "Unlimited bookings", "Priority chat", "Portfolio gallery"], current: true },
];

const businessPlans = [
  { name: "Business Pro", price: 3000, features: ["10 service listings", "Team members", "CRM tools", "County analytics"], current: false },
  { name: "Enterprise", price: 5000, features: ["Unlimited listings", "Full team", "API access", "Priority support", "Featured profile"], current: false },
];

const stats = [
  { label: "Bookings", value: "67", icon: Calendar, change: "+15%" },
  { label: "Rating", value: "4.8", icon: Star, change: "+0.1" },
  { label: "Views", value: "1,234", icon: Eye, change: "+22%" },
  { label: "Response", value: "< 5m", icon: Clock, change: "Fast" },
];

const bookings = [
  { client: "Mary W.", service: "Deep Cleaning", date: "Today, 2 PM", status: "confirmed", amount: "KES 3,500" },
  { client: "John K.", service: "House Moving", date: "Tomorrow, 9 AM", status: "pending", amount: "KES 8,000" },
  { client: "Grace N.", service: "Electrical Fix", date: "Fri, 10 AM", status: "confirmed", amount: "KES 2,000" },
  { client: "Peter M.", service: "Deep Cleaning", date: "Sat, 8 AM", status: "pending", amount: "KES 4,500" },
];

const portfolio = [
  { title: "Kitchen Renovation", category: "Plumbing", rating: 5.0, reviews: 12 },
  { title: "Office Wiring", category: "Electrical", rating: 4.9, reviews: 8 },
  { title: "Full House Move", category: "Moving", rating: 4.8, reviews: 23 },
];

const countyStats = [
  { county: "Nairobi", bookings: 45, inquiries: 128, rating: 4.8 },
  { county: "Kiambu", bookings: 12, inquiries: 34, rating: 4.7 },
  { county: "Mombasa", bookings: 10, inquiries: 29, rating: 4.9 },
];

type Tab = "overview" | "bookings" | "portfolio" | "billing";
type ProviderType = "individual" | "business";

const ServiceProviderDashboard = ({ onBack }: ServiceProviderDashboardProps) => {
  const [tab, setTab] = useState<Tab>("overview");
  const [showPayment, setShowPayment] = useState(false);
  const [providerType] = useState<ProviderType>("individual");
  const [showCRUD, setShowCRUD] = useState(false);
  const [showBoost, setShowBoost] = useState(false);

  const currentPlan = individualPlans.find((p) => p.current)!;
  const allPlans = providerType === "individual" ? individualPlans : businessPlans;

  const serviceMpesaPlans = [...individualPlans, ...businessPlans].map((p) => ({
    name: p.name,
    price: p.price,
    duration: "1 month",
    features: p.features,
    popular: p.current,
  }));

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "bookings", label: "Bookings" },
    { key: "portfolio", label: "Portfolio" },
    { key: "billing", label: "Billing" },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto animate-slide-up">
      {showCRUD && <ListingCRUD type="service" onClose={() => setShowCRUD(false)} />}
      {showPayment && (
        <MpesaPaymentFlow
          plans={serviceMpesaPlans}
          selectedPlanIndex={1}
          category="Service Provider Plan"
          onClose={() => setShowPayment(false)}
        />
      )}
      {/* Header */}
      <div className="px-4 pt-5 pb-8" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--trust-light)))" }}>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="p-1"><ArrowLeft className="w-5 h-5 text-primary-foreground" /></button>
          <h1 className="text-lg font-bold text-primary-foreground">Service Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Wrench className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-primary-foreground">SwiftMovers KE</h2>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary-foreground/20">
                <Shield className="w-2.5 h-2.5 text-primary-foreground" />
                <span className="text-[9px] font-bold text-primary-foreground">Verified</span>
              </div>
            </div>
            <p className="text-xs text-primary-foreground/70">Individual · Pro Plan · Movers</p>
          </div>
          <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-primary-foreground/20">
            <User className="w-3 h-3 text-primary-foreground" />
            <span className="text-[10px] font-bold text-primary-foreground">Individual</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-4">
        <div className="flex gap-1 p-1 rounded-xl bg-card card-shadow mb-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {stats.map((s) => (
                <div key={s.label} className="bg-card rounded-2xl card-shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className="w-5 h-5 text-primary" />
                    <span className="text-[10px] font-semibold text-trust bg-trust/10 px-1.5 py-0.5 rounded-full">{s.change}</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <h3 className="text-base font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2 mb-5">
              {[
                { icon: Plus, label: "Add Service", desc: "List a new service", gradient: "gradient-trust", action: () => setShowCRUD(true) },
                { icon: Zap, label: "Boost Profile", desc: "Appear first in searches", gradient: "gradient-premium" },
                { icon: Camera, label: "Add Portfolio", desc: "Showcase your work", gradient: "bg-secondary" },
              ].map((a) => (
                <button key={a.label} onClick={(a as any).action} className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform">
                  <div className={`w-10 h-10 rounded-xl ${a.gradient} flex items-center justify-center`}>
                    <a.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>

            {/* Response Speed */}
            <h3 className="text-base font-semibold mb-3">Your Performance</h3>
            <div className="bg-card rounded-2xl card-shadow p-4 mb-5">
              <div className="space-y-3">
                {[
                  { label: "Response Speed", value: "< 5 mins", badge: "🟢 Fast" },
                  { label: "Completion Rate", value: "96%", badge: "⭐ Excellent" },
                  { label: "Repeat Clients", value: "34%", badge: "📈 Growing" },
                  { label: "Total Reviews", value: "234", badge: "🏆 Top Rated" },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{m.value}</span>
                      <span className="text-[9px] bg-secondary px-1.5 py-0.5 rounded-full">{m.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* County Analytics */}
            <h3 className="text-base font-semibold mb-3">County Coverage</h3>
            <div className="space-y-2 pb-8">
              {countyStats.map((c) => (
                <div key={c.county} className="flex items-center gap-3 p-3 rounded-xl bg-card card-shadow">
                  <MapPin className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.county}</p>
                    <p className="text-xs text-muted-foreground">{c.bookings} bookings · ⭐ {c.rating}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">{c.inquiries} inquiries</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bookings Tab */}
        {tab === "bookings" && (
          <div className="pb-8">
            <h3 className="text-base font-semibold mb-4">Upcoming Bookings</h3>
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.client + b.date} className="bg-card rounded-2xl card-shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">{b.client}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      b.status === "confirmed" ? "bg-trust/10 text-trust" : "bg-accent/10 text-accent-foreground"
                    }`}>{b.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{b.service}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" /> {b.date}
                    </div>
                    <span className="text-xs font-bold text-foreground">{b.amount}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                      <MessageCircle className="w-3 h-3 inline mr-1" /> Chat
                    </button>
                    <button className="flex-1 py-2 rounded-lg bg-secondary text-foreground text-xs font-semibold">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Booking Calendar Mini */}
            <h3 className="text-base font-semibold mt-6 mb-3">This Week</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                const hasBooking = i < 4;
                return (
                  <div key={day} className={`flex-shrink-0 w-12 py-3 rounded-xl flex flex-col items-center gap-1 ${
                    hasBooking ? "bg-primary/10 border border-primary/20" : "bg-card card-shadow"
                  }`}>
                    <span className="text-[10px] text-muted-foreground">{day}</span>
                    <span className="text-sm font-bold">{4 + i}</span>
                    {hasBooking && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {tab === "portfolio" && (
          <div className="pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Your Work</h3>
              <button className="text-xs font-semibold text-primary flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="space-y-3 mb-6">
              {portfolio.map((p) => (
                <div key={p.title} className="bg-card rounded-2xl card-shadow overflow-hidden">
                  <div className="h-32 bg-secondary flex items-center justify-center">
                    <Camera className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold">{p.title}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        <span className="text-xs font-semibold">{p.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.category} · {p.reviews} reviews</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Ratings Summary */}
            <h3 className="text-base font-semibold mb-3">Ratings Breakdown</h3>
            <div className="bg-card rounded-2xl card-shadow p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-foreground">4.8</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= 4 ? "text-accent fill-accent" : "text-accent/30"}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">234 reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[
                    { stars: 5, pct: 72 },
                    { stars: 4, pct: 18 },
                    { stars: 3, pct: 6 },
                    { stars: 2, pct: 3 },
                    { stars: 1, pct: 1 },
                  ].map((r) => (
                    <div key={r.stars} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-3">{r.stars}</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-6 text-right">{r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {tab === "billing" && (
          <div className="pb-8">
            {/* Provider Type Badge */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <User className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xs font-bold text-primary">Individual</p>
                <p className="text-[10px] text-muted-foreground">Current type</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-card card-shadow text-center">
                <Building2 className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-xs font-semibold text-muted-foreground">Business</p>
                <p className="text-[10px] text-muted-foreground">Upgrade</p>
              </div>
            </div>

            {/* Current Plan */}
            <div className="bg-card rounded-2xl card-shadow p-4 mb-5 border-2 border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Current Plan</p>
                  <h3 className="text-lg font-bold text-foreground">{currentPlan.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">KES {currentPlan.price.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">/month</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10 mb-3">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs text-accent-foreground font-medium">Renews in 8 days</span>
              </div>
              <button onClick={() => setShowPayment(true)} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Renew Subscription
              </button>
            </div>

            {/* Individual Plans */}
            <h3 className="text-base font-semibold mb-3">Individual Plans</h3>
            <div className="space-y-3 mb-5">
              {individualPlans.map((p) => (
                <div key={p.name} className={`bg-card rounded-2xl card-shadow p-4 ${p.current ? "border-2 border-primary" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold">{p.name}</h4>
                    <span className="text-sm font-bold text-primary">KES {p.price.toLocaleString()}/mo</span>
                  </div>
                  <div className="space-y-1">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-primary" /> {f}
                      </div>
                    ))}
                  </div>
                  {p.current && <div className="mt-2 text-[10px] font-semibold text-primary">✓ Current Plan</div>}
                </div>
              ))}
            </div>

            {/* Business Plans */}
            <h3 className="text-base font-semibold mb-3">Business Plans</h3>
            <div className="space-y-3">
              {businessPlans.map((p) => (
                <div key={p.name} className="bg-card rounded-2xl card-shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold">{p.name}</h4>
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-bold text-primary">KES {p.price.toLocaleString()}/mo</span>
                  </div>
                  <div className="space-y-1">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-primary" /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceProviderDashboard;
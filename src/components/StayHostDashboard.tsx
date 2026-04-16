import { useState, useEffect } from "react";
import KYCPromptBanner from "./KYCPromptBanner";
import KYCSnoozeBanner from "./KYCSnoozeBanner";
import VerificationBadge from "./VerificationBadge";
import { useKYCStatus } from "@/hooks/useKYCStatus";
import {
  ArrowLeft, Eye, Users, MessageCircle, TrendingUp, Crown, Zap, Plus,
  Calendar, BarChart3, Receipt, RefreshCw, MapPin, ChevronRight,
  Home, Star, Clock, CheckCircle2, Bed, Moon as MoonIcon, Edit3, Trash2, MessageCircle as MsgIcon
} from "lucide-react";
import MpesaPaymentFlow from "./MpesaPaymentFlow";
import KYCVerificationFlow from "./KYCVerificationFlow";
import ListingCRUD from "./ListingCRUD";

interface StayHostDashboardProps {
  onBack: () => void;
  autoOpenKYC?: boolean;
  onKYCOpened?: () => void;
}

const plans = [
  { name: "Basic", price: 1000, features: ["2 listings", "Basic calendar", "Guest chat"], current: false },
  { name: "Pro", price: 2500, features: ["10 listings", "Full calendar", "Priority chat", "Featured stays"], current: true },
  { name: "Premium", price: 5000, features: ["Unlimited listings", "Smart pricing", "Priority support", "County heatmaps", "Booking analytics"], current: false },
];

const stats = [
  { label: "Occupancy", value: "78%", icon: Bed, change: "+6%" },
  { label: "Inquiries", value: "156", icon: MsgIcon, change: "+19%" },
  { label: "Bookings", value: "42", icon: Calendar, change: "+11%" },
  { label: "Rating", value: "4.8", icon: Star, change: "+0.2" },
];

const listings = [
  { title: "Cozy Studio Westlands", price: "KES 4,500/night", occupancy: "82%", bookings: 18, rating: 4.9 },
  { title: "Penthouse Kilimani", price: "KES 12,000/night", occupancy: "65%", bookings: 9, rating: 4.7 },
  { title: "Beach View Nyali", price: "KES 6,500/night", occupancy: "91%", bookings: 15, rating: 4.8 },
];

const calendarDays = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  const status = Math.random() > 0.6 ? "booked" : Math.random() > 0.5 ? "blocked" : "available";
  return { day: d.getDate(), month: d.toLocaleDateString("en", { month: "short" }), status };
});

const guestChats = [
  { name: "Alice N.", property: "Cozy Studio", msg: "Is early check-in possible?", time: "5 min ago", unread: 2 },
  { name: "Mark T.", property: "Penthouse Kilimani", msg: "Thanks for the great stay!", time: "2 hrs ago", unread: 0 },
  { name: "Diana W.", property: "Beach View Nyali", msg: "Can I extend by one night?", time: "Yesterday", unread: 1 },
];

const countyOccupancy = [
  { county: "Nairobi", occupancy: "76%", bookings: 28 },
  { county: "Mombasa", occupancy: "91%", bookings: 15 },
  { county: "Nakuru", occupancy: "54%", bookings: 6 },
];

type Tab = "overview" | "calendar" | "guests" | "billing";

const StayHostDashboard = ({ onBack, autoOpenKYC, onKYCOpened }: StayHostDashboardProps) => {
  const [tab, setTab] = useState<Tab>("overview");
  const [showPayment, setShowPayment] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [showCRUD, setShowCRUD] = useState(false);
  const [showKYCDirect, setShowKYCDirect] = useState(false);
  const { isVerified, markVerified } = useKYCStatus("stayhost");

  useEffect(() => {
    if (autoOpenKYC && !isVerified) {
      setShowKYCDirect(true);
      onKYCOpened?.();
    }
  }, [autoOpenKYC, isVerified, onKYCOpened]);
  const currentPlan = plans.find((p) => p.current)!;

  const hostMpesaPlans = plans.map((p) => ({
    name: p.name,
    price: p.price,
    duration: "1 month",
    features: p.features,
    popular: p.current,
  }));

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "calendar", label: "Calendar" },
    { key: "guests", label: "Guests" },
    { key: "billing", label: "Billing" },
  ];

  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto animate-slide-up">
      {showKYCDirect && (
        <KYCVerificationFlow
          onClose={(completed?: boolean) => {
            setShowKYCDirect(false);
            if (completed) markVerified();
          }}
          activeRole="stayhost"
        />
      )}
      {showCRUD && <ListingCRUD type="shortstay" onClose={() => setShowCRUD(false)} />}
      {showPayment && (
        <MpesaPaymentFlow
          plans={hostMpesaPlans}
          selectedPlanIndex={1}
          category="Stay Host Plan"
          onClose={() => setShowPayment(false)}
        />
      )}
      {/* Header */}
      <div className="gradient-premium px-4 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="p-1"><ArrowLeft className="w-5 h-5 text-accent-foreground" /></button>
          <h1 className="text-lg font-bold text-accent-foreground">Stay Host Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent-foreground/20 flex items-center justify-center">
            <Home className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-accent-foreground">John Kamau</h2>
              <VerificationBadge isVerified={isVerified} variant="light" />
            </div>
            <p className="text-xs text-accent-foreground/70">Pro Host · 3 stays</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-4">
        <KYCPromptBanner role="stayhost" />
        <KYCSnoozeBanner role="stayhost" />
        <div className="flex gap-1 p-1 rounded-xl bg-card card-shadow mb-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t.key ? "bg-accent text-accent-foreground" : "text-muted-foreground"
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
                    <s.icon className="w-5 h-5 text-accent" />
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
                { icon: Plus, label: "Add New Stay", desc: "List a new short stay", gradient: "gradient-premium", action: () => setShowCRUD(true) },
                { icon: Zap, label: "Feature Stay", desc: "Boost your listing", gradient: "gradient-trust" },
                { icon: Edit3, label: "Set Pricing", desc: "Nightly rates & cleaning fees", gradient: "bg-secondary" },
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

            {/* Active Stays */}
            <h3 className="text-base font-semibold mb-3">Your Stays</h3>
            <div className="space-y-3 mb-5">
              {listings.map((l) => (
                <div key={l.title} className="bg-card rounded-2xl card-shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold">{l.title}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        <span className="text-xs font-semibold">{l.rating}</span>
                      </div>
                      <button onClick={() => setShowCRUD(true)} className="p-1 rounded-lg bg-secondary">
                        <Edit3 className="w-3 h-3 text-primary" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{l.price}</span>
                    <span>Occ: {l.occupancy}</span>
                    <span>{l.bookings} bookings</span>
                  </div>
                </div>
              ))}
            </div>

            {/* County Occupancy */}
            <h3 className="text-base font-semibold mb-3">County Occupancy</h3>
            <div className="space-y-2 pb-8">
              {countyOccupancy.map((c) => (
                <div key={c.county} className="flex items-center gap-3 p-3 rounded-xl bg-card card-shadow">
                  <MapPin className="w-4 h-4 text-accent" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.county}</p>
                    <p className="text-xs text-muted-foreground">{c.bookings} bookings</p>
                  </div>
                  <span className="text-sm font-bold text-foreground">{c.occupancy}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Calendar Tab */}
        {tab === "calendar" && (
          <div className="pb-8">
            <h3 className="text-base font-semibold mb-3">Availability Calendar</h3>
            <div className="flex gap-3 mb-4">
              {[
                { label: "Available", color: "bg-trust" },
                { label: "Booked", color: "bg-accent" },
                { label: "Blocked", color: "bg-muted-foreground/30" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div className={`w-3 h-3 rounded ${l.color}`} /> {l.label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5 mb-6">
              {calendarDays.map((d, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] font-medium ${
                    d.status === "booked" ? "bg-accent/20 text-accent-foreground border border-accent/30" :
                    d.status === "blocked" ? "bg-muted text-muted-foreground" :
                    "bg-trust/10 text-trust border border-trust/20"
                  }`}
                >
                  <span className="font-bold text-xs">{d.day}</span>
                  <span className="text-[8px]">{d.month}</span>
                </div>
              ))}
            </div>

            <h3 className="text-base font-semibold mb-3">Stay Rules</h3>
            <div className="bg-card rounded-2xl card-shadow p-4 space-y-2">
              {[
                { label: "Min Stay", value: "1 night" },
                { label: "Max Stay", value: "30 nights" },
                { label: "Check-in", value: "2:00 PM" },
                { label: "Check-out", value: "11:00 AM" },
                { label: "Cleaning Fee", value: "KES 1,500" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-semibold text-foreground">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guests Tab */}
        {tab === "guests" && (
          <div className="pb-8">
            <h3 className="text-base font-semibold mb-4">Guest Messages</h3>
            <div className="space-y-2">
              {guestChats.map((c) => (
                <button key={c.name} className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-accent">{c.name.split(" ").map(n => n[0]).join("")}</span>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate">{c.name}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{c.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{c.property}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.msg}</p>
                  </div>
                  {c.unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-accent-foreground">{c.unread}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Recent Booking Requests */}
            <h3 className="text-base font-semibold mt-6 mb-3">Recent Requests</h3>
            <div className="space-y-2">
              {[
                { guest: "Alice N.", stay: "Cozy Studio", date: "Today", nights: "3 nights", status: "Confirmed" },
                { guest: "Mark T.", stay: "Penthouse Kilimani", date: "Yesterday", nights: "2 nights", status: "Confirmed" },
                { guest: "Diana W.", stay: "Beach View Nyali", date: "2 days ago", nights: "5 nights", status: "Pending" },
              ].map((d) => (
                <div key={d.guest} className="flex items-center justify-between p-3 rounded-xl bg-card card-shadow">
                  <div>
                    <p className="text-xs font-semibold">{d.guest}</p>
                    <p className="text-[10px] text-muted-foreground">{d.stay} · {d.nights}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">{d.date}</p>
                    <p className={`text-[10px] font-medium ${d.status === "Confirmed" ? "text-trust" : "text-accent"}`}>{d.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {tab === "billing" && (
          <div className="pb-8">
            <div className="bg-card rounded-2xl card-shadow p-4 mb-5 border-2 border-accent/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Current Plan</p>
                  <h3 className="text-lg font-bold text-foreground">{currentPlan.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent">KES {currentPlan.price.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">/month</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10 mb-3">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs text-accent-foreground font-medium">Renews in 18 days</span>
              </div>
              <button onClick={() => setShowPayment(true)} className="w-full py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Renew Now
              </button>
            </div>

            {/* Booking Trends */}
            <h3 className="text-base font-semibold mb-3">Booking Trend</h3>
            <div className="bg-card rounded-2xl card-shadow p-4 mb-5">
              <div className="flex items-end gap-1 h-24">
                {[45, 62, 38, 78, 55, 90, 72, 85, 68, 95, 80, 88].map((v, i) => (
                  <div key={i} className="flex-1 bg-accent/20 rounded-t" style={{ height: `${v}%` }}>
                    <div className="w-full bg-accent rounded-t" style={{ height: `${v * 0.7}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[9px] text-muted-foreground">
                <span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
              </div>
            </div>

            {/* Plans */}
            <h3 className="text-base font-semibold mb-3">All Plans</h3>
            <div className="space-y-3">
              {plans.map((p) => (
                <div key={p.name} className={`bg-card rounded-2xl card-shadow p-4 ${p.current ? "border-2 border-accent" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold">{p.name}</h4>
                    <span className="text-sm font-bold text-accent">KES {p.price.toLocaleString()}/mo</span>
                  </div>
                  <div className="space-y-1">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-accent" /> {f}
                      </div>
                    ))}
                  </div>
                  {p.current && <div className="mt-2 text-[10px] font-semibold text-accent">✓ Current Plan</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StayHostDashboard;
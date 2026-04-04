import { useState } from "react";
import {
  ArrowLeft, Eye, Users, MessageCircle, TrendingUp, Crown, Zap, Plus,
  Upload, UserPlus, BarChart3, Receipt, RefreshCw, MapPin, ChevronRight,
  Building2, Target, Clock, CheckCircle2, AlertTriangle
} from "lucide-react";
import MpesaPaymentFlow from "./MpesaPaymentFlow";

interface AgencyDashboardProps {
  onBack: () => void;
}

const plans = [
  { name: "Starter", price: 2000, features: ["5 agent accounts", "50 listings", "Basic CRM"], current: false },
  { name: "Growth", price: 5000, features: ["15 agent accounts", "200 listings", "Full CRM", "Lead assignment"], current: true },
  { name: "Enterprise", price: 10000, features: ["Unlimited agents", "Unlimited listings", "Full CRM", "Priority support", "API access"], current: false },
];

const stats = [
  { label: "Total Listings", value: "87", icon: Building2, change: "+14%" },
  { label: "Active Leads", value: "342", icon: Target, change: "+22%" },
  { label: "Conversions", value: "89", icon: TrendingUp, change: "+18%" },
  { label: "Revenue", value: "KES 1.2M", icon: BarChart3, change: "+31%" },
];

const agents = [
  { name: "Sarah M.", listings: 24, leads: 67, conversion: "28%", status: "active" },
  { name: "David O.", listings: 18, leads: 45, conversion: "22%", status: "active" },
  { name: "Grace W.", listings: 31, leads: 89, conversion: "34%", status: "active" },
  { name: "Peter K.", listings: 14, leads: 31, conversion: "19%", status: "away" },
];

const pipeline = [
  { stage: "New", count: 48, color: "bg-blue-500" },
  { stage: "Contacted", count: 32, color: "bg-accent" },
  { stage: "Viewing", count: 18, color: "bg-primary" },
  { stage: "Negotiating", count: 9, color: "bg-purple-500" },
  { stage: "Closed", count: 5, color: "bg-trust" },
];

const topCounties = [
  { name: "Nairobi", conversions: 156, revenue: "KES 780K" },
  { name: "Mombasa", conversions: 67, revenue: "KES 335K" },
  { name: "Kisumu", conversions: 23, revenue: "KES 115K" },
];

type Tab = "overview" | "agents" | "leads" | "billing";

const AgencyDashboard = ({ onBack }: AgencyDashboardProps) => {
  const [tab, setTab] = useState<Tab>("overview");
  const [showPayment, setShowPayment] = useState(false);
  const currentPlan = plans.find((p) => p.current)!;

  const agencyMpesaPlans = plans.map((p) => ({
    name: p.name,
    price: p.price,
    duration: "1 month",
    features: p.features,
    popular: p.current,
  }));

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "agents", label: "Agents" },
    { key: "leads", label: "Leads" },
    { key: "billing", label: "Billing" },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-background overflow-y-auto animate-slide-up">
      {showPayment && (
        <MpesaPaymentFlow
          plans={agencyMpesaPlans}
          selectedPlanIndex={1}
          category="Agency Plan"
          onClose={() => setShowPayment(false)}
        />
      )}
      {/* Header */}
      <div className="gradient-trust px-4 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="p-1"><ArrowLeft className="w-5 h-5 text-primary-foreground" /></button>
          <h1 className="text-lg font-bold text-primary-foreground">Agency Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-primary-foreground">KejaPrime Agency</h2>
            <p className="text-xs text-primary-foreground/70">Growth Plan · 4 agents</p>
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

        {/* Overview Tab */}
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
                { icon: Upload, label: "Bulk Upload", desc: "Import listings via CSV", gradient: "gradient-trust" },
                { icon: UserPlus, label: "Add Agent", desc: "Invite a team member", gradient: "gradient-premium" },
                { icon: Zap, label: "Boost Agency", desc: "Increase visibility", gradient: "bg-secondary" },
              ].map((a) => (
                <button key={a.label} className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform">
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

            {/* CRM Pipeline */}
            <h3 className="text-base font-semibold mb-3">Lead Pipeline</h3>
            <div className="bg-card rounded-2xl card-shadow p-4 mb-5">
              <div className="space-y-3">
                {pipeline.map((p) => (
                  <div key={p.stage} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20">{p.stage}</span>
                    <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${p.color} rounded-full flex items-center justify-end pr-2`} style={{ width: `${(p.count / 48) * 100}%` }}>
                        <span className="text-[9px] font-bold text-white">{p.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* County Heatmap */}
            <h3 className="text-base font-semibold mb-3">Top Counties</h3>
            <div className="space-y-2 pb-8">
              {topCounties.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl bg-card card-shadow">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">#{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.conversions} conversions</p>
                  </div>
                  <span className="text-xs font-semibold text-primary">{c.revenue}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Agents Tab */}
        {tab === "agents" && (
          <div className="pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Team Members</h3>
              <button className="text-xs font-semibold text-primary flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5" /> Invite
              </button>
            </div>
            <div className="space-y-3">
              {agents.map((a) => (
                <div key={a.name} className="bg-card rounded-2xl card-shadow p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{a.name.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{a.name}</p>
                        <div className={`w-2 h-2 rounded-full ${a.status === "active" ? "bg-trust" : "bg-accent"}`} />
                      </div>
                      <p className="text-xs text-muted-foreground">{a.listings} listings · {a.leads} leads</p>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{a.conversion}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-secondary text-xs font-medium text-foreground">Assign Leads</button>
                    <button className="flex-1 py-2 rounded-lg bg-secondary text-xs font-medium text-foreground">View Stats</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {tab === "leads" && (
          <div className="pb-8">
            <h3 className="text-base font-semibold mb-4">Recent Leads</h3>
            <div className="space-y-2">
              {[
                { name: "Ann W.", property: "3BR Kilimani", time: "2 min ago", status: "new", agent: "Unassigned" },
                { name: "James M.", property: "2BR Westlands", time: "15 min ago", status: "contacted", agent: "Sarah M." },
                { name: "Lucy K.", property: "Studio Lavington", time: "1 hr ago", status: "viewing", agent: "David O." },
                { name: "Brian N.", property: "1BR South B", time: "3 hrs ago", status: "negotiating", agent: "Grace W." },
                { name: "Faith O.", property: "2BR Karen", time: "Yesterday", status: "closed", agent: "Grace W." },
              ].map((lead) => (
                <div key={lead.name} className="bg-card rounded-xl card-shadow p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold">{lead.name}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      lead.status === "new" ? "bg-blue-100 text-blue-700" :
                      lead.status === "contacted" ? "bg-accent/10 text-accent-foreground" :
                      lead.status === "viewing" ? "bg-primary/10 text-primary" :
                      lead.status === "negotiating" ? "bg-purple-100 text-purple-700" :
                      "bg-trust/10 text-trust"
                    }`}>{lead.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{lead.property} · {lead.time}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Agent: <span className="font-medium text-foreground">{lead.agent}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {tab === "billing" && (
          <div className="pb-8">
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
                <span className="text-xs text-accent-foreground font-medium">Renews in 12 days</span>
              </div>
              <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Renew Now
              </button>
            </div>

            {/* All Plans */}
            <h3 className="text-base font-semibold mb-3">All Plans</h3>
            <div className="space-y-3 mb-5">
              {plans.map((p) => (
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

            {/* Payment History */}
            <h3 className="text-base font-semibold mb-3">Payment History</h3>
            <div className="space-y-2">
              {[
                { date: "1 Apr 2026", amount: "KES 5,000", status: "Paid", ref: "KS8A7F2D" },
                { date: "1 Mar 2026", amount: "KES 5,000", status: "Paid", ref: "KS6B3E1C" },
                { date: "1 Feb 2026", amount: "KES 5,000", status: "Paid", ref: "KS4D9G5H" },
              ].map((p) => (
                <div key={p.ref} className="flex items-center justify-between p-3 rounded-xl bg-card card-shadow">
                  <div>
                    <p className="text-xs font-semibold">{p.date}</p>
                    <p className="text-[10px] text-muted-foreground">Ref: {p.ref}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">{p.amount}</p>
                    <p className="text-[10px] text-trust font-medium">{p.status}</p>
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

export default AgencyDashboard;
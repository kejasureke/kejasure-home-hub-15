import { useState } from "react";
import {
  ArrowLeft, Users, BarChart3, Shield, AlertTriangle, CheckCircle2, Clock,
  Eye, TrendingUp, MapPin, Search, ChevronRight, Crown, Ban, Flag,
  FileWarning, RefreshCw, Coins, Building2, Home, Wrench, User,
  MessageCircle, XCircle, Filter, ChevronDown, Star, Zap, Activity
} from "lucide-react";

interface AdminPanelProps {
  onBack: () => void;
}

type Tab = "users" | "revenue" | "fraud" | "verification" | "moderation";

// Mock data
const usersByRole = [
  { role: "Tenants", count: 12847, icon: User, change: "+342 this week", color: "text-primary" },
  { role: "Landlords", count: 1823, icon: Building2, change: "+67 this week", color: "text-trust" },
  { role: "Agencies", count: 156, icon: Building2, change: "+8 this week", color: "text-accent" },
  { role: "Stay Hosts", count: 489, icon: Home, change: "+23 this week", color: "text-purple-500" },
  { role: "Service Providers", count: 734, icon: Wrench, change: "+41 this week", color: "text-blue-500" },
];

const revenueStreams = [
  { source: "Tenant Unlocks", amount: "KES 2.4M", pct: 38, change: "+22%", color: "bg-primary" },
  { source: "Landlord Plans", amount: "KES 1.8M", pct: 28, change: "+15%", color: "bg-trust" },
  { source: "Agency Plans", amount: "KES 980K", pct: 15, change: "+31%", color: "bg-accent" },
  { source: "Stay Host Plans", amount: "KES 620K", pct: 10, change: "+18%", color: "bg-purple-500" },
  { source: "Service Subs", amount: "KES 410K", pct: 6, change: "+12%", color: "bg-blue-500" },
  { source: "Boosts & Featured", amount: "KES 180K", pct: 3, change: "+45%", color: "bg-pink-500" },
];

const topCounties = [
  { name: "Nairobi", revenue: "KES 3.2M", users: 8420, searches: 45230 },
  { name: "Mombasa", revenue: "KES 890K", users: 2130, searches: 12450 },
  { name: "Kisumu", revenue: "KES 340K", users: 890, searches: 5670 },
  { name: "Nakuru", revenue: "KES 280K", users: 720, searches: 4320 },
  { name: "Kiambu", revenue: "KES 260K", users: 680, searches: 3980 },
];

const topEstates = [
  { name: "Kilimani", county: "Nairobi", searches: 8940 },
  { name: "Westlands", county: "Nairobi", searches: 7620 },
  { name: "Nyali", county: "Mombasa", searches: 4510 },
  { name: "Karen", county: "Nairobi", searches: 3890 },
  { name: "South B", county: "Nairobi", searches: 3240 },
];

const fraudReports = [
  { id: "FR-001", type: "Fake Listing", reporter: "Grace M.", target: "Listing #4521", severity: "high", date: "2 hrs ago", status: "open" },
  { id: "FR-002", type: "Suspicious Profile", reporter: "System", target: "User @landlord_ke", severity: "medium", date: "5 hrs ago", status: "investigating" },
  { id: "FR-003", type: "Scam Attempt", reporter: "Alice W.", target: "User @quick_homes", severity: "critical", date: "Yesterday", status: "open" },
  { id: "FR-004", type: "Duplicate Listing", reporter: "Peter K.", target: "Listing #3892", severity: "low", date: "Yesterday", status: "resolved" },
  { id: "FR-005", type: "Fake Reviews", reporter: "System", target: "Service @cleanpro", severity: "medium", date: "2 days ago", status: "investigating" },
];

const verificationQueue = [
  { name: "Mary Wanjiku", type: "Landlord", doc: "National ID", submitted: "1 hr ago", status: "pending" },
  { name: "KejaPrime Agency", type: "Agency", doc: "Business Certificate", submitted: "3 hrs ago", status: "pending" },
  { name: "SwiftMovers KE", type: "Service Provider", doc: "KRA PIN", submitted: "5 hrs ago", status: "pending" },
  { name: "David Ochieng", type: "Stay Host", doc: "National ID", submitted: "Yesterday", status: "review" },
  { name: "Grace Builders", type: "Agency", doc: "Agency Logo", submitted: "Yesterday", status: "review" },
  { name: "NetConnect KE", type: "Service Provider", doc: "Portfolio", submitted: "2 days ago", status: "approved" },
];

const disputes = [
  { id: "D-012", tenant: "John M.", landlord: "Alice K.", issue: "Listing photos don't match", status: "open", date: "Today" },
  { id: "D-011", tenant: "Grace W.", host: "Peter N.", issue: "Refund for cancelled stay", status: "escalated", date: "Yesterday" },
  { id: "D-010", tenant: "Faith O.", provider: "CleanPro", issue: "Service not delivered", status: "resolved", date: "3 days ago" },
];

const failedPayments = [
  { user: "James K.", plan: "Landlord Pro", amount: "KES 1,000", reason: "Insufficient funds", date: "1 hr ago" },
  { user: "Ann W.", plan: "Tenant Unlock", amount: "KES 100", reason: "Timeout", date: "3 hrs ago" },
  { user: "Peter M.", plan: "Service Basic", amount: "KES 500", reason: "Wrong PIN", date: "Yesterday" },
];

const expiringSubscriptions = [
  { user: "KejaPrime Agency", plan: "Growth", amount: "KES 5,000", expires: "Tomorrow" },
  { user: "SwiftMovers KE", plan: "Pro", amount: "KES 1,000", expires: "2 days" },
  { user: "David O.", plan: "Landlord Premium", amount: "KES 2,000", expires: "3 days" },
  { user: "Mary W.", plan: "Stay Host Pro", amount: "KES 2,500", expires: "5 days" },
];

const topProviders = [
  { name: "SwiftMovers KE", category: "Movers", revenue: "KES 180K", rating: 4.8 },
  { name: "CleanPro Solutions", category: "Cleaners", revenue: "KES 145K", rating: 4.6 },
  { name: "PowerFix Electricals", category: "Electricians", revenue: "KES 120K", rating: 4.9 },
];

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [tab, setTab] = useState<Tab>("users");

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "users", label: "Users", icon: Users },
    { key: "revenue", label: "Revenue", icon: DollarSign },
    { key: "fraud", label: "Fraud", icon: AlertTriangle },
    { key: "verification", label: "Verify", icon: Shield },
    { key: "moderation", label: "Moderate", icon: Flag },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-background overflow-y-auto animate-slide-up">
      {/* Header */}
      <div className="px-4 pt-5 pb-8 bg-foreground">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="p-1"><ArrowLeft className="w-5 h-5 text-background" /></button>
          <h1 className="text-lg font-bold text-background">Admin Panel</h1>
          <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/20">
            <Activity className="w-3 h-3 text-destructive" />
            <span className="text-[10px] font-bold text-destructive">3 Critical</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-background/10 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-background">16,049</p>
            <p className="text-[10px] text-background/60">Total Users</p>
          </div>
          <div className="bg-background/10 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-background">KES 6.4M</p>
            <p className="text-[10px] text-background/60">Monthly Rev</p>
          </div>
          <div className="bg-background/10 rounded-xl p-2.5 text-center">
            <p className="text-lg font-bold text-background">47</p>
            <p className="text-[10px] text-background/60">Counties</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-4">
        <div className="flex gap-0.5 p-1 rounded-xl bg-card card-shadow mb-4 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-semibold transition-all min-w-0 ${
                tab === t.key ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ========== USERS TAB ========== */}
        {tab === "users" && (
          <div className="pb-8">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users by name, phone, email..."
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-card card-shadow text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Users by Role */}
            <h3 className="text-base font-semibold mb-3">Users by Role</h3>
            <div className="space-y-2 mb-5">
              {usersByRole.map((r) => (
                <div key={r.role} className="flex items-center gap-3 p-3.5 rounded-2xl bg-card card-shadow">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <r.icon className={`w-5 h-5 ${r.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{r.role}</p>
                      <p className="text-base font-bold text-foreground">{r.count.toLocaleString()}</p>
                    </div>
                    <p className="text-[10px] text-trust font-medium">{r.change}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Churn Analytics */}
            <h3 className="text-base font-semibold mb-3">Churn Analytics</h3>
            <div className="bg-card rounded-2xl card-shadow p-4 mb-5">
              <div className="space-y-3">
                {[
                  { role: "Landlords", churn: "4.2%", trend: "down", retained: "95.8%" },
                  { role: "Agencies", churn: "2.1%", trend: "down", retained: "97.9%" },
                  { role: "Stay Hosts", churn: "5.8%", trend: "up", retained: "94.2%" },
                  { role: "Services", churn: "6.3%", trend: "up", retained: "93.7%" },
                ].map((c) => (
                  <div key={c.role} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{c.role}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-trust">{c.retained} retained</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        c.trend === "down" ? "bg-trust/10 text-trust" : "bg-destructive/10 text-destructive"
                      }`}>
                        {c.trend === "down" ? "↓" : "↑"} {c.churn}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Expiry Monitor */}
            <h3 className="text-base font-semibold mb-3">Expiring Soon</h3>
            <div className="space-y-2">
              {expiringSubscriptions.map((s) => (
                <div key={s.user} className="flex items-center justify-between p-3 rounded-xl bg-card card-shadow">
                  <div>
                    <p className="text-xs font-semibold">{s.user}</p>
                    <p className="text-[10px] text-muted-foreground">{s.plan} · {s.amount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{s.expires}</span>
                    <button className="text-[10px] font-bold text-primary">Remind</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== REVENUE TAB ========== */}
        {tab === "revenue" && (
          <div className="pb-8">
            {/* Revenue by Stream */}
            <h3 className="text-base font-semibold mb-3">Revenue Breakdown</h3>
            <div className="bg-card rounded-2xl card-shadow p-4 mb-5">
              {/* Bar visualization */}
              <div className="flex h-4 rounded-full overflow-hidden mb-4">
                {revenueStreams.map((r) => (
                  <div key={r.source} className={`${r.color}`} style={{ width: `${r.pct}%` }} />
                ))}
              </div>
              <div className="space-y-2.5">
                {revenueStreams.map((r) => (
                  <div key={r.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                      <span className="text-xs text-muted-foreground">{r.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{r.amount}</span>
                      <span className="text-[9px] font-semibold text-trust">{r.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <h3 className="text-base font-semibold mb-3">Monthly Trend</h3>
            <div className="bg-card rounded-2xl card-shadow p-4 mb-5">
              <div className="flex items-end gap-1 h-28">
                {[32, 45, 38, 52, 48, 62, 55, 70, 64, 78, 72, 85].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-stretch gap-0.5">
                    <div className="bg-primary/20 rounded-t flex-1" style={{ height: `${v}%` }}>
                      <div className="w-full bg-primary rounded-t" style={{ height: `${v * 0.65}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[9px] text-muted-foreground">
                <span>May</span><span>Jul</span><span>Sep</span><span>Nov</span><span>Jan</span><span>Mar</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Recurring</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary/20" /> One-time</span>
              </div>
            </div>

            {/* Top Counties */}
            <h3 className="text-base font-semibold mb-3">Top Converting Counties</h3>
            <div className="space-y-2 mb-5">
              {topCounties.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl bg-card card-shadow">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white ${
                    i === 0 ? "bg-accent" : i === 1 ? "bg-primary" : "bg-muted-foreground"
                  }`}>#{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.users.toLocaleString()} users · {c.searches.toLocaleString()} searches</p>
                  </div>
                  <span className="text-xs font-bold text-primary">{c.revenue}</span>
                </div>
              ))}
            </div>

            {/* Most Searched Estates */}
            <h3 className="text-base font-semibold mb-3">Most Searched Estates</h3>
            <div className="space-y-2 mb-5">
              {topEstates.map((e, i) => (
                <div key={e.name} className="flex items-center justify-between p-3 rounded-xl bg-card card-shadow">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
                    <div>
                      <p className="text-xs font-semibold">{e.name}</p>
                      <p className="text-[10px] text-muted-foreground">{e.county}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{e.searches.toLocaleString()} searches</span>
                </div>
              ))}
            </div>

            {/* Top Earning Providers */}
            <h3 className="text-base font-semibold mb-3">Top Earning Providers</h3>
            <div className="space-y-2">
              {topProviders.map((p) => (
                <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl bg-card card-shadow">
                  <Wrench className="w-4 h-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.category} · ⭐ {p.rating}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">{p.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== FRAUD TAB ========== */}
        {tab === "fraud" && (
          <div className="pb-8">
            {/* Fraud Summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Open", value: "12", color: "text-destructive", bg: "bg-destructive/10" },
                { label: "Investigating", value: "8", color: "text-accent", bg: "bg-accent/10" },
                { label: "Resolved", value: "156", color: "text-trust", bg: "bg-trust/10" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Fraud Alerts */}
            <h3 className="text-base font-semibold mb-3">Recent Reports</h3>
            <div className="space-y-2 mb-5">
              {fraudReports.map((r) => (
                <div key={r.id} className={`bg-card rounded-2xl card-shadow p-4 ${
                  r.severity === "critical" ? "border-l-4 border-destructive" :
                  r.severity === "high" ? "border-l-4 border-accent" : ""
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                        r.severity === "critical" ? "bg-destructive/10 text-destructive" :
                        r.severity === "high" ? "bg-accent/10 text-accent-foreground" :
                        r.severity === "medium" ? "bg-blue-100 text-blue-700" :
                        "bg-secondary text-secondary-foreground"
                      }`}>{r.severity}</span>
                      <span className="text-xs font-semibold">{r.type}</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      r.status === "open" ? "bg-destructive/10 text-destructive" :
                      r.status === "investigating" ? "bg-accent/10 text-accent-foreground" :
                      "bg-trust/10 text-trust"
                    }`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Target: <span className="font-medium text-foreground">{r.target}</span></p>
                  <p className="text-[10px] text-muted-foreground">Reported by {r.reporter} · {r.date}</p>
                  {r.status !== "resolved" && (
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold">Investigate</button>
                      <button className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-[10px] font-semibold">Ban User</button>
                      <button className="flex-1 py-2 rounded-lg bg-secondary text-foreground text-[10px] font-semibold">Dismiss</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Failed STK Pushes */}
            <h3 className="text-base font-semibold mb-3">Failed Payments</h3>
            <div className="space-y-2">
              {failedPayments.map((p) => (
                <div key={p.user + p.date} className="flex items-center gap-3 p-3 rounded-xl bg-card card-shadow">
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold">{p.user}</p>
                    <p className="text-[10px] text-muted-foreground">{p.plan} · {p.amount} · {p.reason}</p>
                  </div>
                  <button className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== VERIFICATION TAB ========== */}
        {tab === "verification" && (
          <div className="pb-8">
            {/* Queue Summary */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Pending", value: "23", color: "text-accent", bg: "bg-accent/10" },
                { label: "In Review", value: "8", color: "text-blue-500", bg: "bg-blue-100" },
                { label: "Approved", value: "1,247", color: "text-trust", bg: "bg-trust/10" },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Verification Queue */}
            <h3 className="text-base font-semibold mb-3">Verification Queue</h3>
            <div className="space-y-3">
              {verificationQueue.map((v) => (
                <div key={v.name} className="bg-card rounded-2xl card-shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">{v.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{v.name}</p>
                        <p className="text-[10px] text-muted-foreground">{v.type}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      v.status === "pending" ? "bg-accent/10 text-accent-foreground" :
                      v.status === "review" ? "bg-blue-100 text-blue-700" :
                      "bg-trust/10 text-trust"
                    }`}>{v.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Shield className="w-3 h-3" />
                    <span>{v.doc}</span>
                    <span>·</span>
                    <Clock className="w-3 h-3" />
                    <span>{v.submitted}</span>
                  </div>
                  {v.status !== "approved" && (
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button className="flex-1 py-2 rounded-lg bg-secondary text-foreground text-xs font-semibold">Request More</button>
                      <button className="py-2 px-3 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold">
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== MODERATION TAB ========== */}
        {tab === "moderation" && (
          <div className="pb-8">
            {/* Anti-scam Banner Stats */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="text-xs font-bold text-destructive">Anti-Scam Monitor</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-lg font-bold text-foreground">47</p>
                  <p className="text-[10px] text-muted-foreground">Flagged today</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">12</p>
                  <p className="text-[10px] text-muted-foreground">Auto-blocked</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">98.2%</p>
                  <p className="text-[10px] text-muted-foreground">Trust score</p>
                </div>
              </div>
            </div>

            {/* Disputes */}
            <h3 className="text-base font-semibold mb-3">Active Disputes</h3>
            <div className="space-y-3 mb-5">
              {disputes.map((d) => (
                <div key={d.id} className="bg-card rounded-2xl card-shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground">{d.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      d.status === "open" ? "bg-destructive/10 text-destructive" :
                      d.status === "escalated" ? "bg-accent/10 text-accent-foreground" :
                      "bg-trust/10 text-trust"
                    }`}>{d.status}</span>
                  </div>
                  <p className="text-sm font-semibold mb-1">{d.issue}</p>
                  <p className="text-[10px] text-muted-foreground mb-3">
                    {d.tenant} vs {d.landlord || d.host || d.provider} · {d.date}
                  </p>
                  {d.status !== "resolved" && (
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold">Review</button>
                      <button className="flex-1 py-2 rounded-lg bg-accent/10 text-accent-foreground text-[10px] font-semibold">Escalate</button>
                      <button className="flex-1 py-2 rounded-lg bg-trust/10 text-trust text-[10px] font-semibold">Resolve</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Moderation Queue */}
            <h3 className="text-base font-semibold mb-3">Content Moderation</h3>
            <div className="space-y-2 mb-5">
              {[
                { type: "Listing", title: "Suspicious pricing: KES 500/mo 3BR Kilimani", flag: "Auto-flagged", severity: "high" },
                { type: "Review", title: "Offensive language in review for CleanPro", flag: "User report", severity: "medium" },
                { type: "Chat", title: "External payment link shared in chat", flag: "Auto-detected", severity: "critical" },
                { type: "Profile", title: "Impersonation: Fake agency credentials", flag: "User report", severity: "high" },
              ].map((m, i) => (
                <div key={i} className="bg-card rounded-xl card-shadow p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        m.severity === "critical" ? "bg-destructive/10 text-destructive" :
                        m.severity === "high" ? "bg-accent/10 text-accent-foreground" :
                        "bg-blue-100 text-blue-700"
                      }`}>{m.severity}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{m.type}</span>
                    </div>
                    <span className="text-[9px] text-muted-foreground">{m.flag}</span>
                  </div>
                  <p className="text-xs font-medium text-foreground">{m.title}</p>
                  <div className="flex gap-2 mt-2">
                    <button className="text-[10px] font-bold text-primary">Review</button>
                    <button className="text-[10px] font-bold text-destructive">Remove</button>
                    <button className="text-[10px] font-bold text-muted-foreground">Dismiss</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Audit Log */}
            <h3 className="text-base font-semibold mb-3">Audit Log</h3>
            <div className="space-y-1.5">
              {[
                { action: "Approved verification", target: "Mary W.", admin: "Admin", time: "10 min ago" },
                { action: "Banned user", target: "@scam_listings", admin: "Admin", time: "1 hr ago" },
                { action: "Resolved dispute", target: "D-010", admin: "Admin", time: "3 hrs ago" },
                { action: "Removed listing", target: "#4521 (fake)", admin: "Admin", time: "5 hrs ago" },
                { action: "Approved agency", target: "KejaPrime", admin: "Admin", time: "Yesterday" },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-card">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-[11px] text-muted-foreground flex-1">
                    <span className="font-semibold text-foreground">{log.action}</span> — {log.target}
                  </p>
                  <span className="text-[9px] text-muted-foreground shrink-0">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
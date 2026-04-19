import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

const PORTFOLIO_STORAGE_KEY = "kejasure_provider_portfolio_v1";

type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviews: number;
  photos: string[];
  beforeAfter?: { before: string; after: string };
};

const loadPortfolio = (fallback: PortfolioItem[]): PortfolioItem[] => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as PortfolioItem[];
    return fallback;
  } catch {
    return fallback;
  }
};
import {
  ArrowLeft, Eye, Users, MessageCircle, TrendingUp, Zap, Plus, X,
  Calendar, BarChart3, RefreshCw, MapPin, ChevronRight, ChevronLeft,
  Star, Clock, CheckCircle2, Wrench, Camera, Shield, Award, User, Building2, Image, Trash2, ArrowLeftRight, Pencil, GripVertical, RotateCcw
} from "lucide-react";
import MpesaPaymentFlow from "./MpesaPaymentFlow";
import BoostProcessingOverlay from "./BoostProcessingOverlay";
import BeforeAfterSlider from "./BeforeAfterSlider";
import ListingCRUD from "./ListingCRUD";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

const initialPortfolio = [
  {
    id: "p1", title: "Kitchen Renovation", category: "Plumbing", rating: 5.0, reviews: 12,
    photos: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&h=300&fit=crop",
    ],
    beforeAfter: {
      before: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      after: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
    },
  },
  {
    id: "p2", title: "Office Wiring", category: "Electrical", rating: 4.9, reviews: 8,
    photos: [
      "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
    ],
    beforeAfter: {
      before: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
      after: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
    },
  },
  {
    id: "p3", title: "Full House Move", category: "Moving", rating: 4.8, reviews: 23,
    photos: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7c3376?w=400&h=300&fit=crop",
    ],
  },
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
  const [boostProcessing, setBoostProcessing] = useState<string | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => loadPortfolio(initialPortfolio));
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolioItems));
    } catch {
      // ignore quota errors
    }
  }, [portfolioItems]);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const portfolioCategories = useMemo(
    () => ["All", ...Array.from(new Set(portfolioItems.map((p) => p.category)))],
    [portfolioItems],
  );

  useEffect(() => {
    if (categoryFilter !== "All" && !portfolioItems.some((p) => p.category === categoryFilter)) {
      setCategoryFilter("All");
    }
  }, [portfolioItems, categoryFilter]);

  const filteredPortfolio = useMemo(
    () => (categoryFilter === "All" ? portfolioItems : portfolioItems.filter((p) => p.category === categoryFilter)),
    [portfolioItems, categoryFilter],
  );

  const isPortfolioModified = JSON.stringify(portfolioItems) !== JSON.stringify(initialPortfolio);

  const resetPortfolio = () => {
    setPortfolioItems(initialPortfolio);
    try {
      window.localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
    } catch {
      // ignore
    }
    setShowResetConfirm(false);
    toast.success("Portfolio reset", { description: "Restored to default sample projects." });
  };

  const reorderPortfolio = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    setPortfolioItems((prev) => {
      const fromIdx = prev.findIndex((i) => i.id === fromId);
      const toIdx = prev.findIndex((i) => i.id === toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    toast.success("Portfolio reordered");
  };
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectCategory, setNewProjectCategory] = useState("");
  const [newProjectPhotos, setNewProjectPhotos] = useState<string[]>([]);
  const [includeBeforeAfter, setIncludeBeforeAfter] = useState(false);
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const resetProjectForm = () => {
    setNewProjectTitle("");
    setNewProjectCategory("");
    setNewProjectPhotos([]);
    setIncludeBeforeAfter(false);
    setBeforePhoto(null);
    setAfterPhoto(null);
    setEditingId(null);
  };

  const closeProjectModal = () => {
    setShowAddProject(false);
    resetProjectForm();
  };

  const openEditProject = (id: string) => {
    const project = portfolioItems.find((p) => p.id === id);
    if (!project) return;
    setEditingId(id);
    setNewProjectTitle(project.title);
    setNewProjectCategory(project.category);
    setNewProjectPhotos(project.photos);
    if (project.beforeAfter) {
      setIncludeBeforeAfter(true);
      setBeforePhoto(project.beforeAfter.before);
      setAfterPhoto(project.beforeAfter.after);
    } else {
      setIncludeBeforeAfter(false);
      setBeforePhoto(null);
      setAfterPhoto(null);
    }
    setShowAddProject(true);
  };

  const openAddProject = () => {
    resetProjectForm();
    setShowAddProject(true);
  };

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
      {showBoost && (
        <div className="fixed inset-0 z-[70] flex items-end bg-foreground/30 backdrop-blur-sm" onClick={() => setShowBoost(false)}>
          <div className="w-full bg-card rounded-t-3xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">⚡ Boost Your Profile</h3>
              <button onClick={() => setShowBoost(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Get 5x more visibility and appear at the top of search results for 7 days.</p>
            <div className="space-y-3 mb-5">
              {[
                { name: "3-Day Boost", price: "KES 200", desc: "3x more views" },
                { name: "7-Day Boost", price: "KES 400", desc: "5x more views + badge" },
                { name: "30-Day Boost", price: "KES 1,200", desc: "10x views + featured" },
              ].map((b) => (
                <button key={b.name} onClick={() => { setShowBoost(false); setBoostProcessing(b.name); toast.success("Boost selected!", { description: `${b.name} — ${b.desc}` }); }} className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary active:scale-[0.98] transition-transform">
                  <div>
                    <p className="text-sm font-semibold">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.desc}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{b.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {boostProcessing && (
        <BoostProcessingOverlay
          boostName={boostProcessing}
          onComplete={() => { setBoostProcessing(null); setShowPayment(true); }}
        />
      )}
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
                { icon: Zap, label: "Boost Profile", desc: "Appear first in searches", gradient: "gradient-premium", action: () => setShowBoost(true) },
                { icon: Camera, label: "Add Portfolio", desc: "Showcase your work", gradient: "bg-secondary", action: () => setTab("portfolio") },
              ].map((a) => (
                <button key={a.label} onClick={a.action} className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform">
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
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent("open-service-chat", { detail: { name: b.client, avatar: "👤" } }))}
                      className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold active:scale-[0.98] transition-transform"
                    >
                      <MessageCircle className="w-3 h-3 inline mr-1" /> Chat
                    </button>
                    <button
                      onClick={() => setTab("bookings")}
                      className="flex-1 py-2 rounded-lg bg-secondary text-foreground text-xs font-semibold active:scale-[0.98] transition-transform"
                    >
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
              <div className="flex items-center gap-3">
                {isPortfolioModified && (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="text-xs font-semibold text-muted-foreground flex items-center gap-1 active:scale-95 transition-transform"
                    aria-label="Reset portfolio to defaults"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
                <button onClick={openAddProject} className="text-xs font-semibold text-primary flex items-center gap-1 active:scale-95 transition-transform">
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>
            </div>

            {portfolioItems.length > 0 && (() => {
              const totalPhotos = portfolioItems.reduce((sum, p) => sum + p.photos.length, 0);
              const avgRating = portfolioItems.reduce((sum, p) => sum + p.rating, 0) / portfolioItems.length;
              return (
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-2xl bg-card card-shadow">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-primary" />
                      <span className="text-base font-bold">{portfolioItems.length}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Projects</span>
                  </div>
                  <div className="flex flex-col items-center border-x border-border">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                      <span className="text-base font-bold">{avgRating.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Avg rating</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <Image className="w-3.5 h-3.5 text-primary" />
                      <span className="text-base font-bold">{totalPhotos}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-0.5">Photos</span>
                  </div>
                </div>
              );
            })()}

            {/* Category filter chips */}
            {portfolioCategories.length > 2 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-1 px-1">
                {portfolioCategories.map((cat) => {
                  const count = cat === "All" ? portfolioItems.length : portfolioItems.filter((p) => p.category === cat).length;
                  const active = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-card text-foreground border border-border hover:bg-secondary"
                      }`}
                    >
                      {cat} <span className={active ? "opacity-80" : "text-muted-foreground"}>· {count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Portfolio projects */}
            <div className="space-y-4 mb-6">
              {filteredPortfolio.map((p, idx) => (
                <div
                  key={p.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggingId(p.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggingId && draggingId !== p.id) setDragOverId(p.id);
                  }}
                  onDragLeave={() => {
                    if (dragOverId === p.id) setDragOverId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggingId) reorderPortfolio(draggingId, p.id);
                    setDraggingId(null);
                    setDragOverId(null);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDragOverId(null);
                  }}
                  className={`bg-card rounded-2xl card-shadow overflow-hidden transition-all ${
                    draggingId === p.id ? "opacity-40 scale-[0.98]" : ""
                  } ${dragOverId === p.id ? "ring-2 ring-primary" : ""}`}
                >
                  {/* Photo gallery */}
                  <div className="relative">
                    <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                      {p.photos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt={`${p.title} ${i + 1}`}
                          className="w-full h-40 object-cover shrink-0 snap-center cursor-pointer"
                          onClick={() => {
                            setLightboxPhotos(p.photos);
                            setLightboxIndex(i);
                            setLightboxPhoto(photo);
                          }}
                        />
                      ))}
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
                      <span className="text-[10px] font-medium text-white flex items-center gap-1">
                        <Image className="w-3 h-3" /> {p.photos.length}
                      </span>
                    </div>
                    {p.beforeAfter && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary/90 backdrop-blur-sm flex items-center gap-1">
                        <ArrowLeftRight className="w-2.5 h-2.5 text-primary-foreground" />
                        <span className="text-[10px] font-bold text-primary-foreground">Before/After</span>
                      </div>
                    )}
                  </div>
                  {/* Before/After slider */}
                  {p.beforeAfter && (
                    <div className="px-4 pt-3">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Before / After</p>
                      <BeforeAfterSlider
                        beforeImage={p.beforeAfter.before}
                        afterImage={p.beforeAfter.after}
                        height="h-36"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="p-1 -ml-1 cursor-grab active:cursor-grabbing touch-none text-muted-foreground"
                          aria-label="Drag to reorder"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-semibold truncate">{p.title}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 mr-1">
                          <Star className="w-3 h-3 text-accent fill-accent" />
                          <span className="text-xs font-semibold">{p.rating}</span>
                        </div>
                        <button
                          onClick={() => idx > 0 && reorderPortfolio(p.id, filteredPortfolio[idx - 1].id)}
                          disabled={idx === 0}
                          className="p-1 rounded-lg bg-secondary active:scale-90 transition-transform disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ChevronLeft className="w-3 h-3 rotate-90" />
                        </button>
                        <button
                          onClick={() => idx < filteredPortfolio.length - 1 && reorderPortfolio(p.id, filteredPortfolio[idx + 1].id)}
                          disabled={idx === filteredPortfolio.length - 1}
                          className="p-1 rounded-lg bg-secondary active:scale-90 transition-transform disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ChevronRight className="w-3 h-3 rotate-90" />
                        </button>
                        <button
                          onClick={() => openEditProject(p.id)}
                          className="p-1 rounded-lg bg-primary/10 active:scale-90 transition-transform"
                          aria-label="Edit project"
                        >
                          <Pencil className="w-3 h-3 text-primary" />
                        </button>
                        <button
                          onClick={() => setDeletingId(p.id)}
                          className="p-1 rounded-lg bg-destructive/10 active:scale-90 transition-transform"
                          aria-label="Delete project"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.category} · {p.reviews} reviews</p>
                  </div>
                </div>
              ))}

              {portfolioItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No projects yet</p>
                  <p className="text-xs text-muted-foreground text-center">Add your best work to showcase to potential clients</p>
                </div>
              )}

              {portfolioItems.length > 0 && filteredPortfolio.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10">
                  <p className="text-sm font-medium mb-1">No projects in {categoryFilter}</p>
                  <button
                    onClick={() => setCategoryFilter("All")}
                    className="text-xs font-semibold text-primary mt-1 active:scale-95 transition-transform"
                  >
                    Show all projects
                  </button>
                </div>
              )}
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

      {/* Add / Edit Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 z-[70] flex items-end bg-foreground/30 backdrop-blur-sm" onClick={closeProjectModal}>
          <div className="w-full max-w-lg mx-auto bg-card rounded-t-3xl p-5 pb-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingId ? "✏️ Edit Project" : "📸 Add Project"}</h3>
              <button onClick={closeProjectModal}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Project Title</label>
                <input
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g., Living Room Painting"
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {["Plumbing", "Electrical", "Moving", "Cleaning", "Painting", "Carpentry", "Other"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewProjectCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                        newProjectCategory === cat ? "gradient-trust text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">Photos</label>
                <div className="flex gap-2 flex-wrap">
                  {newProjectPhotos.map((photo, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setNewProjectPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      // Simulate photo upload with random Unsplash images
                      const mockPhotos = [
                        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1560185008-b033106af5c8?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
                      ];
                      const available = mockPhotos.filter((p) => !newProjectPhotos.includes(p));
                      if (available.length > 0) {
                        setNewProjectPhotos((prev) => [...prev, available[Math.floor(Math.random() * available.length)]]);
                        toast.success("Photo added!");
                      }
                    }}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <Camera className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground">Upload</span>
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Add up to 5 photos of your work</p>
              </div>

              {/* Before / After section */}
              <div className="rounded-2xl border border-border bg-secondary/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-xs font-semibold text-foreground block">Before / After Comparison</label>
                    <p className="text-[10px] text-muted-foreground">Show the transformation with a slider</p>
                  </div>
                  <button
                    onClick={() => {
                      setIncludeBeforeAfter((v) => !v);
                      if (includeBeforeAfter) {
                        setBeforePhoto(null);
                        setAfterPhoto(null);
                      }
                    }}
                    className={`relative w-10 h-6 rounded-full transition-colors ${includeBeforeAfter ? "bg-primary" : "bg-muted"}`}
                    aria-label="Toggle before/after"
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        includeBeforeAfter ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {includeBeforeAfter && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { label: "Before", photo: beforePhoto, setter: setBeforePhoto, mocks: [
                          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
                          "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
                          "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop",
                        ] },
                        { label: "After", photo: afterPhoto, setter: setAfterPhoto, mocks: [
                          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
                          "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
                          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
                        ] },
                      ] as const).map((slot) => (
                        <div key={slot.label}>
                          <p className="text-[10px] font-semibold text-muted-foreground mb-1">{slot.label}</p>
                          {slot.photo ? (
                            <div className="relative w-full h-24 rounded-xl overflow-hidden">
                              <img src={slot.photo} alt={slot.label} className="w-full h-full object-cover" />
                              <button
                                onClick={() => slot.setter(null)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                              >
                                <X className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                const pick = slot.mocks[Math.floor(Math.random() * slot.mocks.length)];
                                slot.setter(pick);
                                toast.success(`${slot.label} photo added!`);
                              }}
                              className="w-full h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                            >
                              <Camera className="w-4 h-4 text-muted-foreground" />
                              <span className="text-[9px] text-muted-foreground">Upload {slot.label}</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {beforePhoto && afterPhoto ? (
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</p>
                          <button
                            onClick={() => {
                              const prevBefore = beforePhoto;
                              setBeforePhoto(afterPhoto);
                              setAfterPhoto(prevBefore);
                              toast.success("Photos swapped", { description: "Before and After are now reversed." });
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-full bg-card border border-border active:scale-95 transition-transform"
                            aria-label="Swap before and after"
                          >
                            <ArrowLeftRight className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-semibold text-foreground">Swap</span>
                          </button>
                        </div>
                        <BeforeAfterSlider
                          beforeImage={beforePhoto}
                          afterImage={afterPhoto}
                          height="h-32"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">Tap Swap to reverse Before / After</p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted-foreground">Add both photos to enable the comparison slider.</p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (!(newProjectTitle.trim() && newProjectCategory && newProjectPhotos.length > 0)) return;
                  if (includeBeforeAfter && (!beforePhoto || !afterPhoto)) {
                    toast.error("Add both Before and After photos", { description: "Or turn off the comparison toggle." });
                    return;
                  }
                  const beforeAfterField = includeBeforeAfter && beforePhoto && afterPhoto
                    ? { beforeAfter: { before: beforePhoto, after: afterPhoto } }
                    : {};

                  if (editingId) {
                    setPortfolioItems((prev) =>
                      prev.map((item) =>
                        item.id === editingId
                          ? {
                              ...item,
                              title: newProjectTitle.trim(),
                              category: newProjectCategory,
                              photos: newProjectPhotos,
                              beforeAfter: includeBeforeAfter && beforePhoto && afterPhoto
                                ? { before: beforePhoto, after: afterPhoto }
                                : undefined,
                            }
                          : item
                      )
                    );
                    toast.success("Project updated!", { description: "Your changes have been saved." });
                  } else {
                    setPortfolioItems((prev) => [
                      {
                        id: `p_${Date.now()}`,
                        title: newProjectTitle.trim(),
                        category: newProjectCategory,
                        rating: 0,
                        reviews: 0,
                        photos: newProjectPhotos,
                        ...beforeAfterField,
                      },
                      ...prev,
                    ]);
                    toast.success("Project added!", { description: "Your portfolio has been updated." });
                  }
                  closeProjectModal();
                }}
                className={`w-full py-4 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform ${
                  newProjectTitle.trim() && newProjectCategory && newProjectPhotos.length > 0
                    ? "gradient-trust text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {editingId ? "Save Changes" : "Add to Portfolio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (() => {
        const matchingProject = portfolioItems.find(
          (p) => p.beforeAfter && (p.beforeAfter.before === lightboxPhoto || p.beforeAfter.after === lightboxPhoto)
        );
        const baRole = matchingProject
          ? matchingProject.beforeAfter!.before === lightboxPhoto ? "Before" : "After"
          : null;
        return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90" onClick={() => setLightboxPhoto(null)}>
          <button onClick={() => setLightboxPhoto(null)} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-5 h-5 text-white" />
          </button>
          {lightboxPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIdx = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length;
                  setLightboxIndex(newIdx);
                  setLightboxPhoto(lightboxPhotos[newIdx]);
                }}
                className="absolute left-3 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIdx = (lightboxIndex + 1) % lightboxPhotos.length;
                  setLightboxIndex(newIdx);
                  setLightboxPhoto(lightboxPhotos[newIdx]);
                }}
                className="absolute right-3 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}
          <img
            src={lightboxPhoto}
            alt="Portfolio photo"
            className="max-w-[90%] max-h-[80vh] object-contain rounded-xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
          {baRole && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm shadow-lg animate-fade-in">
              <ArrowLeftRight className="w-3 h-3 text-primary-foreground" />
              <span className="text-[11px] font-bold text-primary-foreground">{baRole}</span>
              {matchingProject && (
                <span className="text-[10px] font-medium text-primary-foreground/80 ml-1 max-w-[140px] truncate">· {matchingProject.title}</span>
              )}
            </div>
          )}
          <div className="absolute bottom-6 flex items-center gap-1.5">
            {lightboxPhotos.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === lightboxIndex ? "bg-white" : "bg-white/30"}`}
              />
            ))}
          </div>
        </div>
        );
      })()}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="max-w-[90vw] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const item = portfolioItems.find((p) => p.id === deletingId);
                return item
                  ? `"${item.title}" will be permanently removed from your portfolio. This action cannot be undone.`
                  : "This project will be permanently removed from your portfolio. This action cannot be undone.";
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingId) {
                  const idx = portfolioItems.findIndex((item) => item.id === deletingId);
                  const removed = portfolioItems[idx];
                  if (!removed) {
                    setDeletingId(null);
                    return;
                  }
                  setPortfolioItems((prev) => prev.filter((item) => item.id !== deletingId));
                  setDeletingId(null);
                  toast.success("Project deleted", {
                    description: `"${removed.title}" was removed from your portfolio.`,
                    duration: 6000,
                    action: {
                      label: "Undo",
                      onClick: () => {
                        setPortfolioItems((prev) => {
                          if (prev.some((item) => item.id === removed.id)) return prev;
                          const next = [...prev];
                          const insertAt = Math.min(idx, next.length);
                          next.splice(insertAt, 0, removed);
                          return next;
                        });
                        toast.success("Project restored");
                      },
                    },
                  });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="max-w-[90vw] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset portfolio to defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              All your saved projects, edits, and the current order will be cleared and replaced with the default sample portfolio. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={resetPortfolio}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceProviderDashboard;
import { useState, useEffect } from "react";
import { toast } from "sonner";
import KYCPromptBanner from "./KYCPromptBanner";
import KYCSnoozeBanner from "./KYCSnoozeBanner";
import VerificationBadge from "./VerificationBadge";
import { useKYCStatus } from "@/hooks/useKYCStatus";
import { Eye, Users, MessageCircle, Calendar, Zap, Plus, TrendingUp, Crown, ArrowLeft, Edit3, Trash2, CheckCircle2, X, Clock, MapPin } from "lucide-react";
import MpesaPaymentFlow from "./MpesaPaymentFlow";
import BoostProcessingOverlay from "./BoostProcessingOverlay";
import KYCVerificationFlow from "./KYCVerificationFlow";
import ListingCRUD from "./ListingCRUD";
import { pushGlobalAlert } from "@/hooks/useInAppNotifications";

interface DashboardScreenProps {
  onBack: () => void;
  autoOpenKYC?: boolean;
  onKYCOpened?: () => void;
}

const stats = [
  { label: "Views", value: "2,847", icon: Eye, change: "+12%" },
  { label: "Leads", value: "148", icon: Users, change: "+8%" },
  { label: "Chats", value: "67", icon: MessageCircle, change: "+23%" },
  { label: "Bookings", value: "12", icon: Calendar, change: "+5%" },
];

const landlordPlans = [
  { name: "Basic", price: 500, duration: "1 month", features: ["3 listings", "Basic analytics"] },
  { name: "Pro", price: 1000, duration: "1 month", features: ["10 listings", "Priority chat", "Boost"], popular: true },
  { name: "Premium", price: 2000, duration: "1 month", features: ["Unlimited listings", "Featured badge", "County heatmaps", "Priority support"] },
];

interface BookingRequest {
  id: string;
  tenantName: string;
  tenantAvatar: string;
  property: string;
  date: string;
  time: string;
  note?: string;
  status: "pending" | "accepted" | "declined";
  requestedAt: string;
}

const initialBookingRequests: BookingRequest[] = [
  { id: "b1", tenantName: "Mary Wanjiku", tenantAvatar: "MW", property: "3BR Kilimani", date: "Apr 8", time: "10:00 AM", note: "I'd like to see the master bedroom and parking", status: "pending", requestedAt: "5 mins ago" },
  { id: "b2", tenantName: "David Ochieng", tenantAvatar: "DO", property: "2BR Westlands", date: "Apr 9", time: "2:00 PM", status: "pending", requestedAt: "1 hr ago" },
  { id: "b3", tenantName: "Sarah Njeri", tenantAvatar: "SN", property: "Studio Westlands", date: "Apr 7", time: "11:00 AM", note: "Coming with my partner", status: "accepted", requestedAt: "Yesterday" },
];

const DashboardScreen = ({ onBack, autoOpenKYC, onKYCOpened }: DashboardScreenProps) => {
  const [showPayment, setShowPayment] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const [boostProcessing, setBoostProcessing] = useState<string | null>(null);
  const [showCRUD, setShowCRUD] = useState(false);
  const [showKYCDirect, setShowKYCDirect] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(initialBookingRequests);
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null);
  const [myListings, setMyListings] = useState([
    { title: "3BR Kilimani", views: 847, leads: 23, status: "active" },
    { title: "2BR Westlands", views: 612, leads: 18, status: "active" },
    { title: "Studio Westlands", views: 1203, leads: 45, status: "active" },
  ]);
  const { isVerified, markVerified } = useKYCStatus("landlord");

  useEffect(() => {
    if (autoOpenKYC && !isVerified) {
      setShowKYCDirect(true);
      onKYCOpened?.();
    }
  }, [autoOpenKYC, isVerified, onKYCOpened]);

  const handleDeleteConfirm = () => {
    if (deletingIdx === null) return;
    const removed = myListings[deletingIdx];
    setMyListings((prev) => prev.filter((_, i) => i !== deletingIdx));
    setDeletingIdx(null);
    toast.success("Listing deleted", {
      description: `${removed.title} has been removed.`,
      action: {
        label: "Undo",
        onClick: () => setMyListings((prev) => {
          const next = [...prev];
          next.splice(deletingIdx, 0, removed);
          return next;
        }),
      },
    });
  };

  const handleBookingAction = (id: string, action: "accepted" | "declined") => {
    setBookingRequests(prev => prev.map(b => b.id === id ? { ...b, status: action } : b));
    const booking = bookingRequests.find(b => b.id === id);
    if (booking) {
      pushGlobalAlert({
        type: "booking",
        title: action === "accepted"
          ? `Viewing accepted for ${booking.tenantName}`
          : `Viewing declined for ${booking.tenantName}`,
        body: action === "accepted"
          ? `${booking.property} on ${booking.date} at ${booking.time} — contact shared with tenant.`
          : `${booking.property} viewing request on ${booking.date} has been declined.`,
        action: "open-dashboard",
      });
    }
  };

  const pendingCount = bookingRequests.filter(b => b.status === "pending").length;

  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto animate-slide-up">
      {showKYCDirect && (
        <KYCVerificationFlow
          onClose={(completed?: boolean) => {
            setShowKYCDirect(false);
            if (completed) markVerified();
          }}
          activeRole="landlord"
        />
      )}
      {showCRUD && (
        <ListingCRUD type="rental" onClose={() => { setShowCRUD(false); setEditIdx(null); }} />
      )}
      {boostProcessing && (
        <BoostProcessingOverlay
          boostName={boostProcessing}
          onComplete={() => { setBoostProcessing(null); setShowPayment(true); }}
        />
      )}
      {showPayment && (
        <MpesaPaymentFlow
          plans={landlordPlans}
          selectedPlanIndex={1}
          category="Landlord Plan"
          onClose={() => setShowPayment(false)}
        />
      )}
      {showBoost && (
        <div className="fixed inset-0 z-[70] flex items-end bg-foreground/30 backdrop-blur-sm" onClick={() => setShowBoost(false)}>
          <div className="w-full max-w-lg mx-auto bg-card rounded-t-3xl p-5 pb-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">⚡ Boost Your Listings</h3>
              <button onClick={() => setShowBoost(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              {[
                { name: "3-Day Boost", price: "KES 300", desc: "3x more views" },
                { name: "7-Day Boost", price: "KES 600", desc: "5x more views + badge" },
                { name: "30-Day Boost", price: "KES 1,500", desc: "10x views + featured" },
              ].map((b) => (
                <button key={b.name} onClick={() => { setShowBoost(false); setBoostProcessing(b.name); toast.success("Boost selected!", { description: `${b.name} — ${b.desc}` }); }} className="w-full flex items-center justify-between p-4 rounded-2xl bg-secondary active:scale-[0.98] transition-transform">
                  <div>
                    <p className="text-sm font-semibold text-left">{b.name}</p>
                    <p className="text-xs text-muted-foreground">{b.desc}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{b.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="gradient-trust px-4 pt-safe pb-8">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="p-1">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-lg font-bold text-primary-foreground">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">JK</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-primary-foreground">John Kamau</h2>
              <VerificationBadge isVerified={isVerified} variant="light" />
            </div>
            <p className="text-xs text-primary-foreground/70">Landlord · 4 listings</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-4">
        <KYCPromptBanner role="landlord" />
        <KYCSnoozeBanner role="landlord" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl card-shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-semibold text-trust bg-trust/10 px-1.5 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Booking Requests */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            Booking Requests
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {pendingCount} new
              </span>
            )}
          </h3>
        </div>
        <div className="space-y-3 mb-6">
          {bookingRequests.map((req) => (
            <div key={req.id} className={`p-4 rounded-2xl bg-card card-shadow border ${
              req.status === "pending" ? "border-primary/20" : req.status === "accepted" ? "border-trust/20" : "border-border"
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                  {req.tenantAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{req.tenantName}</p>
                  <p className="text-xs text-muted-foreground">{req.property} · {req.requestedAt}</p>
                </div>
                {req.status === "pending" && (
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-[10px] font-semibold text-accent-foreground">Pending</span>
                )}
                {req.status === "accepted" && (
                  <span className="px-2 py-0.5 rounded-full bg-trust/10 text-[10px] font-semibold text-trust">Accepted</span>
                )}
                {req.status === "declined" && (
                  <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-[10px] font-semibold text-destructive">Declined</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{req.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{req.time}</span>
              </div>
              {req.note && (
                <p className="text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2 mb-3">"{req.note}"</p>
              )}
              {req.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBookingAction(req.id, "accepted")}
                    className="flex-1 py-2.5 rounded-xl gradient-trust text-xs font-semibold text-primary-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleBookingAction(req.id, "declined")}
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-xs font-semibold text-secondary-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h3 className="text-base font-semibold mb-3">Quick Actions</h3>
        <div className="space-y-3 mb-6">
          <button onClick={() => setShowCRUD(true)} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-xl gradient-trust flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Add New Listing</p>
              <p className="text-xs text-muted-foreground">Create a new property listing</p>
            </div>
          </button>
          <button onClick={() => setShowBoost(true)} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-xl gradient-premium flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Boost Listings</p>
              <p className="text-xs text-muted-foreground">Get more visibility and leads</p>
            </div>
          </button>
          <button onClick={() => setShowPayment(true)} className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Crown className="w-5 h-5 text-gold" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Premium Subscription</p>
              <p className="text-xs text-muted-foreground">Active · Expires in 5 days</p>
            </div>
          </button>
        </div>

        {/* Active Listings */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Active Listings</h3>
          <button onClick={() => setShowCRUD(true)} className="text-xs font-semibold text-primary flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>
        <div className="space-y-3 pb-8">
          {myListings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-2xl gradient-trust flex items-center justify-center mb-3 text-3xl">
                🏠
              </div>
              <h4 className="text-base font-bold text-foreground mb-1">No listings yet</h4>
              <p className="text-xs text-muted-foreground max-w-[240px] mx-auto mb-4">
                Post your first property to start reaching thousands of verified tenants across Kenya.
              </p>
              <button
                onClick={() => setShowCRUD(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" /> Create your first listing
              </button>
              <p className="text-[10px] text-muted-foreground mt-3">Free · Takes ~3 minutes</p>
            </div>
          ) : myListings.map((listing, i) => (
            <div key={listing.title} className="flex items-center gap-3 p-3 rounded-xl bg-card card-shadow">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-lg">🏠</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{listing.title}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{listing.leads}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditIdx(i); setShowCRUD(true); }} className="p-1.5 rounded-lg bg-secondary">
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                </button>
                <button onClick={() => setDeletingIdx(i)} aria-label="Delete listing" className="p-1.5 rounded-lg bg-secondary active:scale-90 transition-transform">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirmation */}
      {deletingIdx !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setDeletingIdx(null)}>
          <div className="w-[85%] max-w-sm bg-card rounded-3xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center mb-4">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                <Trash2 className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="text-lg font-bold">Delete listing?</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                "{myListings[deletingIdx]?.title}" will be removed. Active leads and chats will be archived.
              </p>
            </div>
            <button
              onClick={handleDeleteConfirm}
              className="w-full py-3.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold mb-2 active:scale-[0.98] transition-transform"
            >
              Yes, Delete Listing
            </button>
            <button onClick={() => setDeletingIdx(null)} className="w-full py-3 rounded-xl text-sm font-semibold text-muted-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardScreen;

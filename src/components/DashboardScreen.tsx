import { useState } from "react";
import { Eye, Users, MessageCircle, Calendar, Zap, Plus, TrendingUp, Crown, ArrowLeft } from "lucide-react";
import MpesaPaymentFlow from "./MpesaPaymentFlow";

interface DashboardScreenProps {
  onBack: () => void;
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

const DashboardScreen = ({ onBack }: DashboardScreenProps) => {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="fixed inset-0 z-40 bg-background overflow-y-auto animate-slide-up">
      {showPayment && (
        <MpesaPaymentFlow
          plans={landlordPlans}
          selectedPlanIndex={1}
          category="Landlord Plan"
          onClose={() => setShowPayment(false)}
        />
      )}
      {/* Header */}
      <div className="gradient-trust px-4 pt-5 pb-8">
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
            <h2 className="text-base font-semibold text-primary-foreground">John Kamau</h2>
            <p className="text-xs text-primary-foreground/70">Landlord · 4 listings</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-4">
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

        {/* Quick Actions */}
        <h3 className="text-base font-semibold mb-3">Quick Actions</h3>
        <div className="space-y-3 mb-6">
          <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-xl gradient-trust flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Add New Listing</p>
              <p className="text-xs text-muted-foreground">Create a new property listing</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-xl gradient-premium flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Boost Listings</p>
              <p className="text-xs text-muted-foreground">Get more visibility and leads</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform">
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
        <h3 className="text-base font-semibold mb-3">Active Listings</h3>
        <div className="space-y-3 pb-8">
          {[
            { title: "3BR Kilimani", views: 847, leads: 23 },
            { title: "2BR Westlands", views: 612, leads: 18 },
            { title: "Studio Westlands", views: 1203, leads: 45 },
          ].map((listing) => (
            <div key={listing.title} className="flex items-center gap-3 p-3 rounded-xl bg-card card-shadow">
              <div className="w-12 h-12 rounded-xl bg-secondary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{listing.title}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{listing.leads}</span>
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-trust" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;

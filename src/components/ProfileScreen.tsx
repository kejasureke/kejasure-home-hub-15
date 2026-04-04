import { User, Settings, ShieldCheck, Crown, ChevronRight, LogOut, HelpCircle, Bell, BarChart3 } from "lucide-react";
import { useState } from "react";
import DashboardScreen from "./DashboardScreen";
import NotificationsScreen from "./NotificationsScreen";

const ProfileScreen = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (showDashboard) {
    return <DashboardScreen onBack={() => setShowDashboard(false)} />;
  }

  if (showNotifications) {
    return <NotificationsScreen onBack={() => setShowNotifications(false)} />;
  }

  const menuItems = [
    { icon: BarChart3, label: "Landlord Dashboard", subtitle: "Manage your listings", action: () => setShowDashboard(true) },
    { icon: Crown, label: "Premium Plan", subtitle: "Active · 5 days left" },
    { icon: ShieldCheck, label: "Verification", subtitle: "ID Verified ✓" },
    { icon: Bell, label: "Notifications", subtitle: "Manage alerts" },
    { icon: Settings, label: "Settings", subtitle: "Account preferences" },
    { icon: HelpCircle, label: "Help & Support", subtitle: "FAQs and contact" },
  ];

  return (
    <div className="pb-24 px-4 pt-5">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl gradient-trust flex items-center justify-center">
          <span className="text-xl font-bold text-primary-foreground">JK</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-bold">John Kamau</h2>
            <ShieldCheck className="w-4 h-4 text-trust" />
          </div>
          <p className="text-sm text-muted-foreground">+254 712 345 678</p>
          <div className="tier-badge-premium mt-1 inline-block">Premium Member</div>
        </div>
        <button className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
          <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-card" />
        </button>
      </div>

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <button className="w-full flex items-center gap-3 p-4 rounded-2xl mt-4 active:scale-[0.98] transition-transform text-destructive">
        <LogOut className="w-5 h-5" />
        <span className="text-sm font-semibold">Sign Out</span>
      </button>
    </div>
  );
};

export default ProfileScreen;

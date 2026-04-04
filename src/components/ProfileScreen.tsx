import { User, Settings, ShieldCheck, Crown, ChevronRight, LogOut, HelpCircle, Bell, BarChart3, Sun, Moon, Monitor, Building2, Home, Wrench, Shield, Scale } from "lucide-react";
import { useState } from "react";
import DashboardScreen from "./DashboardScreen";
import AgencyDashboard from "./AgencyDashboard";
import StayHostDashboard from "./StayHostDashboard";
import ServiceProviderDashboard from "./ServiceProviderDashboard";
import AdminPanel from "./AdminPanel";
import DisputeFlow from "./DisputeFlow";
import NotificationsScreen from "./NotificationsScreen";
import { useTheme } from "@/hooks/useTheme";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";
import { useNotifications } from "@/hooks/useNotifications";

const ProfileScreen = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAgency, setShowAgency] = useState(false);
  const [showStayHost, setShowStayHost] = useState(false);
  const [showServiceProvider, setShowServiceProvider] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, setTheme } = useTheme();
  const { alerts, unreadCount: liveUnread, soundEnabled, markAlertRead, markAllAlertsRead, toggleSound } = useInAppNotifications();
  const { unreadCount: storedUnread } = useNotifications();

  const role = typeof window !== "undefined" ? localStorage.getItem("kejasure_role") : null;

  if (showDashboard) return <DashboardScreen onBack={() => setShowDashboard(false)} />;
  if (showAgency) return <AgencyDashboard onBack={() => setShowAgency(false)} />;
  if (showStayHost) return <StayHostDashboard onBack={() => setShowStayHost(false)} />;
  if (showServiceProvider) return <ServiceProviderDashboard onBack={() => setShowServiceProvider(false)} />;
  if (showAdmin) return <AdminPanel onBack={() => setShowAdmin(false)} />;
  if (showDispute) return <DisputeFlow onClose={() => setShowDispute(false)} />;
  if (showNotifications) return (
    <NotificationsScreen
      onBack={() => setShowNotifications(false)}
      liveAlerts={alerts}
      onMarkAlertRead={markAlertRead}
      onMarkAllAlertsRead={markAllAlertsRead}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
    />
  );

  // Build dashboard menu item based on role
  const getDashboardItem = () => {
    switch (role) {
      case "agency":
        return { icon: Building2, label: "Agency Dashboard", subtitle: "Manage agents & listings", action: () => setShowAgency(true) };
      case "stayhost":
        return { icon: Home, label: "Stay Host Dashboard", subtitle: "Manage your stays", action: () => setShowStayHost(true) };
      case "service":
        return { icon: Wrench, label: "Service Dashboard", subtitle: "Manage your services", action: () => setShowServiceProvider(true) };
      default:
        return { icon: BarChart3, label: "Landlord Dashboard", subtitle: "Manage your listings", action: () => setShowDashboard(true) };
    }
  };

  const dashboardItem = getDashboardItem();

  const menuItems = [
    { icon: dashboardItem.icon, label: dashboardItem.label, subtitle: dashboardItem.subtitle, action: dashboardItem.action },
    // Show all dashboards for demo/testing
    ...(role !== "agency" ? [{ icon: Building2, label: "Agency Dashboard", subtitle: "Multi-agent management", action: () => setShowAgency(true) }] : []),
    ...(role !== "stayhost" ? [{ icon: Home, label: "Stay Host Dashboard", subtitle: "Short stay management", action: () => setShowStayHost(true) }] : []),
    ...(role !== "service" ? [{ icon: Wrench, label: "Service Dashboard", subtitle: "Service provider tools", action: () => setShowServiceProvider(true) }] : []),
    { icon: Shield, label: "Admin Panel", subtitle: "Platform management", action: () => setShowAdmin(true) },
    { icon: Crown, label: "Premium Plan", subtitle: "Active · 5 days left" },
    { icon: ShieldCheck, label: "Verification", subtitle: "ID Verified ✓" },
    { icon: Scale, label: "Disputes & Safety", subtitle: "Report issues & track disputes", action: () => setShowDispute(true) },
    { icon: Bell, label: "Notifications", subtitle: "Manage alerts", action: () => setShowNotifications(true) },
    { icon: Settings, label: "Settings", subtitle: "Account preferences" },
    { icon: HelpCircle, label: "Help & Support", subtitle: "FAQs and contact" },
  ];

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "Auto" },
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
        <button
          onClick={() => setShowNotifications(true)}
          className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
        >
          <Bell className="w-5 h-5 text-primary" />
          {(storedUnread + liveUnread) > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center px-1 border-2 border-background">
              {storedUnread + liveUnread > 99 ? "99+" : storedUnread + liveUnread}
            </span>
          )}
        </button>
        </button>
      </div>

      {/* Theme toggle */}
      <div className="mb-4 p-1 rounded-xl bg-secondary flex gap-1">
        {themeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              theme === opt.value
                ? "bg-card card-shadow text-foreground"
                : "text-muted-foreground"
            }`}
          >
            <opt.icon className="w-3.5 h-3.5" />
            {opt.label}
          </button>
        ))}
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
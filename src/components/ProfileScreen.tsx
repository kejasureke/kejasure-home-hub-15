import { User, Settings, ShieldCheck, Crown, ChevronRight, LogOut, HelpCircle, Bell, BarChart3, Building2, Home, Wrench, Shield, Scale, Search, Star, MapPin, Zap, Briefcase, Palmtree, RefreshCw } from "lucide-react";
import VerificationBadge from "./VerificationBadge";
import { useKYCStatus } from "@/hooks/useKYCStatus";
import { useState } from "react";
import DashboardScreen from "./DashboardScreen";
import AgencyDashboard from "./AgencyDashboard";
import StayHostDashboard from "./StayHostDashboard";
import ServiceProviderDashboard from "./ServiceProviderDashboard";
import AdminPanel from "./AdminPanel";
import DisputeFlow from "./DisputeFlow";
import NotificationsScreen from "./NotificationsScreen";
import KYCVerificationFlow from "./KYCVerificationFlow";
import SettingsScreen from "./SettingsScreen";
import HelpSupportScreen from "./HelpSupportScreen";
import SavedSearchesScreen from "./SavedSearchesScreen";
import ReviewRatingFlow from "./ReviewRatingFlow";
import SubscriptionPlans from "./SubscriptionPlans";
import NeighborhoodSafety from "./NeighborhoodSafety";
import BoostListingFlow from "./BoostListingFlow";
import { useTheme } from "@/hooks/useTheme";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";
import { useNotifications } from "@/hooks/useNotifications";
import { useUserRole } from "@/hooks/useUserRole";
import type { UserRole } from "@/components/onboarding/RoleSelection";

const roleConfig: { id: UserRole; icon: any; label: string; short: string }[] = [
  { id: "tenant", icon: Home, label: "Tenant", short: "🏠" },
  { id: "landlord", icon: Building2, label: "Landlord", short: "🏢" },
  { id: "agency", icon: Briefcase, label: "Agency", short: "💼" },
  { id: "stayhost", icon: Palmtree, label: "Host", short: "🌴" },
  { id: "serviceprovider", icon: Wrench, label: "Service", short: "🔧" },
];

const ProfileScreen = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAgency, setShowAgency] = useState(false);
  const [showStayHost, setShowStayHost] = useState(false);
  const [showServiceProvider, setShowServiceProvider] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showNeighborhood, setShowNeighborhood] = useState(false);
  const [showBoost, setShowBoost] = useState(false);
  const { alerts, unreadCount: liveUnread, soundEnabled, markAlertRead, markAllAlertsRead, toggleSound, dismissAlert, restoreAlert } = useInAppNotifications();
  const { unreadCount: storedUnread } = useNotifications();
  const { role, setRole, isTenant } = useUserRole();

  const { isVerified } = useKYCStatus(role);

  if (showDashboard) return <DashboardScreen onBack={() => setShowDashboard(false)} />;
  if (showAgency) return <AgencyDashboard onBack={() => setShowAgency(false)} />;
  if (showStayHost) return <StayHostDashboard onBack={() => setShowStayHost(false)} />;
  if (showServiceProvider) return <ServiceProviderDashboard onBack={() => setShowServiceProvider(false)} />;
  if (showAdmin) return <AdminPanel onBack={() => setShowAdmin(false)} />;
  if (showDispute) return <DisputeFlow onClose={() => setShowDispute(false)} />;
  if (showKYC) return <KYCVerificationFlow onClose={() => setShowKYC(false)} activeRole={role} />;
  if (showSettings) return <SettingsScreen onBack={() => setShowSettings(false)} />;
  if (showHelp) return <HelpSupportScreen onBack={() => setShowHelp(false)} />;
  if (showSavedSearches) return (
    <SavedSearchesScreen
      onBack={() => setShowSavedSearches(false)}
      onRunSearch={(search) => {
        setShowSavedSearches(false);
        window.dispatchEvent(new CustomEvent("run-saved-search", { detail: search }));
      }}
    />
  );
  if (showReviews) return <ReviewRatingFlow onClose={() => setShowReviews(false)} />;
  if (showSubscription) return <SubscriptionPlans onBack={() => setShowSubscription(false)} currentRole={role} />;
  if (showNeighborhood) return <NeighborhoodSafety onBack={() => setShowNeighborhood(false)} />;
  if (showBoost) return <BoostListingFlow onBack={() => setShowBoost(false)} />;
  if (showNotifications) return (
    <NotificationsScreen
      onBack={() => setShowNotifications(false)}
      liveAlerts={alerts}
      onMarkAlertRead={markAlertRead}
      onMarkAllAlertsRead={markAllAlertsRead}
      onDismissAlert={dismissAlert}
      onRestoreAlert={restoreAlert}
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
      case "serviceprovider":
        return { icon: Wrench, label: "Service Dashboard", subtitle: "Manage your services", action: () => setShowServiceProvider(true) };
      default:
        return { icon: BarChart3, label: "Landlord Dashboard", subtitle: "Manage your listings", action: () => setShowDashboard(true) };
    }
  };

  const dashboardItem = getDashboardItem();
  const showBoostOption = !isTenant;

  const menuItems = [
    ...(!isTenant ? [{ icon: dashboardItem.icon, label: dashboardItem.label, subtitle: dashboardItem.subtitle, action: dashboardItem.action }] : []),
    { icon: Crown, label: "Subscription Plans", subtitle: "Manage your plan", action: () => setShowSubscription(true) },
    ...(!isTenant ? [{ icon: Zap, label: "Boost Listings", subtitle: "Get more visibility", action: () => setShowBoost(true) }] : []),
    { icon: ShieldCheck, label: "Verification", subtitle: isVerified ? "✓ Verified" : "Verify your identity", action: () => setShowKYC(true) },
    { icon: MapPin, label: "Neighborhood Safety", subtitle: "Area scores & insights", action: () => setShowNeighborhood(true) },
    { icon: Scale, label: "Disputes & Safety", subtitle: "Report issues & track disputes", action: () => setShowDispute(true) },
    { icon: Search, label: "Saved Searches", subtitle: "Manage alerts & filters", action: () => setShowSavedSearches(true) },
    { icon: Star, label: "Reviews & Ratings", subtitle: "View & write reviews", action: () => setShowReviews(true) },
    { icon: Bell, label: "Notifications", subtitle: "Manage alerts", action: () => setShowNotifications(true) },
    { icon: Settings, label: "Settings", subtitle: "Account preferences", action: () => setShowSettings(true) },
    { icon: HelpCircle, label: "Help & Support", subtitle: "FAQs and contact", action: () => setShowHelp(true) },
  ];


  return (
    <div className="pb-32 px-4 pt-5">
      {/* Profile header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl gradient-trust flex items-center justify-center relative">
          <span className="text-xl font-bold text-primary-foreground">JK</span>
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-bold">John Kamau</h2>
            <VerificationBadge isVerified={isVerified} variant="dark" />
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
      </div>



      {/* Role Mode Switcher */}
      <div className="mb-4 p-4 rounded-2xl bg-card card-shadow">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-foreground">Active Mode</p>
            <p className="text-[10px] text-muted-foreground">Switch how you use KejaSure</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
            <RefreshCw className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">
              {roleConfig.find(r => r.id === role)?.label}
            </span>
          </div>
        </div>
        <div className="flex gap-1.5">
          {roleConfig.map((r) => {
            const isActive = role === r.id;
            const roleVerified = localStorage.getItem(`kejasure_kyc_verified_${r.id}`) === "true";
            return (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? "gradient-trust text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-primary/5"
                }`}
              >
                {roleVerified && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                    <ShieldCheck className="w-2.5 h-2.5 text-primary-foreground" />
                  </div>
                )}
                <r.icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : ""}`} />
                <span className="text-[9px] font-semibold leading-tight">{r.label}</span>
              </button>
            );
          })}
        </div>
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

      {/* Social Media */}
      <div className="mt-4 p-4 rounded-2xl bg-card card-shadow">
        <p className="text-xs font-semibold text-muted-foreground mb-3">Follow us</p>
        <div className="flex items-center justify-center gap-4">
          {[
            { label: "TikTok", href: "https://tiktok.com/@kejasure", icon: (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/></svg>
            )},
            { label: "Instagram", href: "https://instagram.com/kejasure", icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            )},
            { label: "Facebook", href: "https://facebook.com/kejasure", icon: (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            )},
            { label: "X", href: "https://x.com/kejasure", icon: (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            )},
          ].map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label={social.label}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>

      <button className="w-full flex items-center gap-3 p-4 rounded-2xl mt-4 active:scale-[0.98] transition-transform text-destructive">
        <LogOut className="w-5 h-5" />
        <span className="text-sm font-semibold">Sign Out</span>
      </button>
    </div>
  );
};

export default ProfileScreen;

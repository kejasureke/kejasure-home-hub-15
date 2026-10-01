import { useState, useEffect, useRef, lazy, Suspense } from "react";
import BottomNav from "@/components/BottomNav";
import HomeFeed from "@/components/HomeFeed";
import ChatList from "@/components/ChatList";
import type { ChatContact } from "@/components/ChatList";
import NotificationToast from "@/components/NotificationToast";
import { PropertyCardSkeleton } from "@/components/Skeleton";

// Heavy screens load on demand, then get prefetched while the phone is idle.
const loaders = {
  chat: () => import("@/components/ChatScreen"),
  profile: () => import("@/components/ProfileScreen"),
  landlord: () => import("@/components/DashboardScreen"),
  stayhost: () => import("@/components/StayHostDashboard"),
  agency: () => import("@/components/AgencyDashboard"),
  service: () => import("@/components/ServiceProviderDashboard"),
  explore: () => import("@/components/ExploreScreen"),
  detail: () => import("@/components/ListingDetail"),
};
const ChatScreen = lazy(loaders.chat);
const ProfileScreen = lazy(loaders.profile);
const DashboardScreen = lazy(loaders.landlord);
const StayHostDashboard = lazy(loaders.stayhost);
const AgencyDashboard = lazy(loaders.agency);
const ServiceProviderDashboard = lazy(loaders.service);
const ExploreScreen = lazy(loaders.explore);
const ListingDetail = lazy(loaders.detail);

const ScreenFallback = () => (
  <div className="px-4 pt-6 pb-32 space-y-4">
    <PropertyCardSkeleton />
    <PropertyCardSkeleton />
  </div>
);
import type { Property } from "@/data/mockData";
import { Heart } from "lucide-react";
import EmptyIllustration from "@/components/EmptyIllustration";
import { useFavorites } from "@/hooks/useFavorites";
import { useNotifications } from "@/hooks/useNotifications";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";
import { useUserRole } from "@/hooks/useUserRole";
import { properties } from "@/data/mockData";
import PropertyCard from "@/components/PropertyCard";
import SwipeablePropertyCard from "@/components/SwipeablePropertyCard";
import { useHardwareBack } from "@/hooks/useHardwareBack";
import { setAppBadgeCount } from "@/lib/despia";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showChat, setShowChat] = useState(false);
  const [chatContact, setChatContact] = useState<ChatContact | null>(null);
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const { unreadCount: storedUnread } = useNotifications();
  const { role, isTenant } = useUserRole();
  const [showKYCFromNotification, setShowKYCFromNotification] = useState(false);
  const [exploreSearchQuery, setExploreSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const {
    alerts,
    toast,
    unreadCount: liveUnread,
    soundEnabled,
    markAlertRead,
    markAllAlertsRead,
    dismissToast,
    toggleSound,
  } = useInAppNotifications();

  const favoriteProperties = properties.filter((p) => favoriteIds.includes(p.id));

  // Listen for service chat open events
  useEffect(() => {
    const handler = (e: Event) => {
      const { name, avatar } = (e as CustomEvent).detail;
      setChatContact({
        id: `service-${name}`,
        name,
        role: "service",
        lastMessage: "",
        time: "Now",
        unread: 0,
        online: true,
        verified: false,
        avatar: avatar || "🔧",
      });
      setShowChat(true);
    };
    window.addEventListener("open-service-chat", handler);
    return () => window.removeEventListener("open-service-chat", handler);
  }, []);

  // Listen for saved search navigation
  useEffect(() => {
    const handler = (e: Event) => {
      const search = (e as CustomEvent).detail;
      const query = search.label || search.estate || search.county || "";
      setExploreSearchQuery(query);
      setActiveTab("search");
    };
    window.addEventListener("run-saved-search", handler);
    return () => window.removeEventListener("run-saved-search", handler);
  }, []);

  // Badge counts
  const chatBadge = 2;
  const profileBadge = storedUnread + liveUnread;

  // Sync native/PWA app icon badge with total unread (chats + notifications).
  useEffect(() => {
    setAppBadgeCount(chatBadge + profileBadge);
  }, [chatBadge, profileBadge]);

  // Prefetch heavy screens once the phone is idle so taps feel instant.
  useEffect(() => {
    const run = () => Object.values(loaders).forEach((l) => l().catch(() => {}));
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(run);
    else setTimeout(run, 1500);
  }, []);

  // Scroll restoration: remember where you were on each tab.
  const scrollPos = useRef<Record<string, number>>({});
  const changeTab = (tab: string) => {
    scrollPos.current[activeTab] = window.scrollY;
    setActiveTab(tab);
  };
  const overlayOpen = !!selectedProperty || showChat;
  useEffect(() => {
    if (overlayOpen) return;
    const y = scrollPos.current[activeTab] ?? 0;
    requestAnimationFrame(() => window.scrollTo(0, y));
  }, [activeTab, overlayOpen]);
  const openProperty = (p: Property) => {
    if (!selectedProperty) scrollPos.current[activeTab] = window.scrollY;
    setSelectedProperty(p);
    window.scrollTo(0, 0);
  };
  const openChat = () => {
    scrollPos.current[activeTab] = window.scrollY;
    setShowChat(true);
  };

  // Hardware back — pop screens in reverse order of depth.
  useHardwareBack(!!selectedProperty, () => setSelectedProperty(null));
  useHardwareBack(showChat, () => setShowChat(false));
  useHardwareBack(!selectedProperty && !showChat && activeTab !== "home", () => changeTab("home"));

  if (selectedProperty) {
    return (
      <Suspense fallback={<ScreenFallback />}>
        <ListingDetail
          property={selectedProperty}
          onBack={() => setSelectedProperty(null)}
          liked={isFavorite(selectedProperty.id)}
          onToggleLike={() => toggleFavorite(selectedProperty.id)}
          onSelectProperty={openProperty}
        />
      </Suspense>
    );
  }

  if (showChat && chatContact) {
    return (
      <Suspense fallback={<ScreenFallback />}>
        <ChatScreen
          onBack={() => setShowChat(false)}
          contactName={chatContact.name}
          contactRole={chatContact.role}
          contactOnline={chatContact.online}
          contactVerified={chatContact.verified}
          propertyContext={chatContact.property}
        />
      </Suspense>
    );
  }

  const renderDashboard = () => {
    const goHome = () => setActiveTab("home");
    const kycProps = {
      autoOpenKYC: showKYCFromNotification,
      onKYCOpened: () => setShowKYCFromNotification(false),
    };
    switch (role) {
      case "landlord":
        return <DashboardScreen onBack={goHome} {...kycProps} />;
      case "stayhost":
        return <StayHostDashboard onBack={goHome} {...kycProps} />;
      case "agency":
        return <AgencyDashboard onBack={goHome} {...kycProps} />;
      case "serviceprovider":
        return <ServiceProviderDashboard onBack={goHome} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {/* In-app notification toast */}
      {toast && (
        <NotificationToast
          alert={toast}
          onDismiss={dismissToast}
          onTap={() => {
            const action = toast.action;
            dismissToast();
            if (action?.startsWith("open-kyc-")) {
              setActiveTab("dashboard");
              setShowKYCFromNotification(true);
            } else if (action === "open-chats") {
              setActiveTab("chats");
            } else if (action === "open-dashboard") {
              setActiveTab("dashboard");
            } else if (action === "open-home") {
              setActiveTab("home");
            } else if (action === "open-favorites") {
              setActiveTab("favorites");
            } else {
              setActiveTab("profile");
            }
          }}
        />
      )}

      <div key={activeTab} className="animate-fade-in">
      <Suspense fallback={<ScreenFallback />}>
        {activeTab === "home" && <HomeFeed />}

        {activeTab === "dashboard" && renderDashboard()}

        {activeTab === "search" && <ExploreScreen initialSearch={exploreSearchQuery} key={exploreSearchQuery} />}

      {activeTab === "favorites" && (
        <div className="px-4 pt-6 pb-32">
          <h1 className="text-xl font-bold mb-4">Saved Properties</h1>
          {favoriteProperties.length > 0 ? (
            <div className="space-y-4">
              {favoriteProperties.map((p) => (
                <SwipeablePropertyCard
                  key={p.id}
                  property={p}
                  onPress={() => openProperty(p)}
                  onRemove={toggleFavorite}
                  onToggleLike={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <EmptyIllustration variant="favorites" className="w-28 h-28 mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">Keja Safi, Keja Sure.</p>
              <p className="text-xs text-muted-foreground text-center px-8">
                Tap the heart on any listing to save it here for later.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "chats" && (
        <ChatList
          onOpenChat={(contact) => {
            setChatContact(contact);
            openChat();
          }}
        />
      )}

      {activeTab === "profile" && <ProfileScreen />}
      </Suspense>
      </div>

      <BottomNav
        activeTab={activeTab}
        chatBadge={chatBadge}
        profileBadge={profileBadge}
        showDashboard={!isTenant}
        onTabChange={changeTab}
        chatBadge={chatBadge}
        profileBadge={profileBadge}
        showDashboard={!isTenant}
      />
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import HomeFeed from "@/components/HomeFeed";
import ChatScreen from "@/components/ChatScreen";
import ChatList from "@/components/ChatList";
import type { ChatContact } from "@/components/ChatList";
import ProfileScreen from "@/components/ProfileScreen";
import NotificationToast from "@/components/NotificationToast";
import DashboardScreen from "@/components/DashboardScreen";
import StayHostDashboard from "@/components/StayHostDashboard";
import AgencyDashboard from "@/components/AgencyDashboard";
import ServiceProviderDashboard from "@/components/ServiceProviderDashboard";
import ExploreScreen from "@/components/ExploreScreen";
import ListingDetail from "@/components/ListingDetail";
import type { Property } from "@/data/mockData";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useNotifications } from "@/hooks/useNotifications";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";
import { useUserRole } from "@/hooks/useUserRole";
import { properties } from "@/data/mockData";
import PropertyCard from "@/components/PropertyCard";
import SwipeablePropertyCard from "@/components/SwipeablePropertyCard";
import { useHardwareBack } from "@/hooks/useHardwareBack";

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

  if (selectedProperty) {
    return (
      <ListingDetail
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
        liked={isFavorite(selectedProperty.id)}
        onToggleLike={() => toggleFavorite(selectedProperty.id)}
        onSelectProperty={(p) => setSelectedProperty(p)}
      />
    );
  }

  if (showChat && chatContact) {
    return (
      <ChatScreen
        onBack={() => setShowChat(false)}
        contactName={chatContact.name}
        contactRole={chatContact.role}
        contactOnline={chatContact.online}
        contactVerified={chatContact.verified}
        propertyContext={chatContact.property}
      />
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
                  onPress={() => setSelectedProperty(p)}
                  onRemove={toggleFavorite}
                  onToggleLike={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Keja Safi, Keja Sure.</p>
              <p className="text-xs text-muted-foreground text-center">
                Properties you save will appear here
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "chats" && (
        <ChatList
          onOpenChat={(contact) => {
            setChatContact(contact);
            setShowChat(true);
          }}
        />
      )}

      {activeTab === "profile" && <ProfileScreen />}

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        chatBadge={chatBadge}
        profileBadge={profileBadge}
        showDashboard={!isTenant}
      />
    </div>
  );
};

export default Index;

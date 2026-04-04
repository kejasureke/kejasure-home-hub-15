import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import HomeFeed from "@/components/HomeFeed";
import ChatScreen from "@/components/ChatScreen";
import ChatList from "@/components/ChatList";
import type { ChatContact } from "@/components/ChatList";
import ProfileScreen from "@/components/ProfileScreen";
import { Heart, Search, MessageCircle } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { properties } from "@/data/mockData";
import PropertyCard from "@/components/PropertyCard";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showChat, setShowChat] = useState(false);
  const [chatContact, setChatContact] = useState<ChatContact | null>(null);
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();

  const favoriteProperties = properties.filter((p) => favoriteIds.includes(p.id));

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

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {activeTab === "home" && <HomeFeed />}

      {activeTab === "search" && (
        <div className="px-4 pt-6 pb-24">
          <h1 className="text-xl font-bold mb-4">Explore</h1>
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search properties, estates, services..."
              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-card card-shadow text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["Bedsitters", "1 Bedroom", "2 Bedroom", "3 Bedroom", "Studio", "Furnished", "Unfurnished", "With Parking"].map((cat) => (
              <button key={cat} className="p-4 rounded-2xl bg-card card-shadow text-sm font-medium text-foreground hover:bg-primary/5 transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "favorites" && (
        <div className="px-4 pt-6 pb-24">
          <h1 className="text-xl font-bold mb-4">Saved Properties</h1>
          {favoriteProperties.length > 0 ? (
            <div className="space-y-4">
              {favoriteProperties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onPress={() => {}}
                  liked={true}
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

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

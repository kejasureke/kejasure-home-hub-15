import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import HomeFeed from "@/components/HomeFeed";
import ChatScreen from "@/components/ChatScreen";
import ProfileScreen from "@/components/ProfileScreen";
import { Heart, Search, MessageCircle } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { properties } from "@/data/mockData";
import PropertyCard from "@/components/PropertyCard";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [showChat, setShowChat] = useState(false);
  const [chatContact, setChatContact] = useState("John Kamau");
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();

  const favoriteProperties = properties.filter((p) => favoriteIds.includes(p.id));

  if (showChat) {
    return <ChatScreen onBack={() => setShowChat(false)} contactName={chatContact} />;
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
        <div className="px-4 pt-6 pb-24">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="space-y-2">
            {[
              { name: "John Kamau", msg: "Saturday at 10 AM works perfectly.", time: "10:35 AM", unread: 1 },
              { name: "Mary Wanjiku", msg: "The apartment is ready for viewing.", time: "Yesterday", unread: 0 },
              { name: "SwiftMovers KE", msg: "We can move you on Friday.", time: "Mon", unread: 3 },
            ].map((chat) => (
              <button
                key={chat.name}
                onClick={() => { setChatContact(chat.name); setShowChat(true); }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">{chat.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold truncate">{chat.name}</h3>
                    <span className="text-[10px] text-muted-foreground shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.msg}</p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 rounded-full gradient-trust flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary-foreground">{chat.unread}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "profile" && <ProfileScreen />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

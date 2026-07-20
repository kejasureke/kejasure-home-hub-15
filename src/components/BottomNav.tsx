import { Home, Search, MessageCircle, User, Heart, LayoutDashboard } from "lucide-react";
import { haptic } from "@/lib/despia";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  chatBadge?: number;
  profileBadge?: number;
  showDashboard?: boolean;
}

const BottomNav = ({ activeTab, onTabChange, chatBadge = 0, profileBadge = 0, showDashboard = false }: BottomNavProps) => {
  const tabs = [
    { id: "home", icon: Home, label: "Home" },
    ...(showDashboard ? [{ id: "dashboard", icon: LayoutDashboard, label: "Dashboard" }] : []),
    { id: "search", icon: Search, label: "Search" },
    { id: "favorites", icon: Heart, label: "Saved" },
    { id: "chats", icon: MessageCircle, label: "Chats" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  const getBadge = (id: string) => {
    if (id === "chats") return chatBadge;
    if (id === "profile") return profileBadge;
    return 0;
  };

  const handleTap = (id: string) => {
    if (id === activeTab) {
      // Re-tap same tab: scroll active view to top
      haptic("light");
      window.dispatchEvent(new CustomEvent("tab-reselected", { detail: { tab: id } }));
      try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch {}
      return;
    }
    haptic("light");
    onTabChange(id);
  };

  const hidden = useHideOnScroll();

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 glass-surface border-t border-border safe-bottom transition-transform duration-300 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const badge = getBadge(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => handleTap(tab.id)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 relative"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 relative ${isActive ? "bg-primary/10 scale-110" : "scale-100"}`} style={{ transitionTimingFunction: isActive ? "cubic-bezier(0.34, 1.56, 0.64, 1)" : "ease-out" }}>
                <tab.icon
                  key={isActive ? `${tab.id}-active` : tab.id}
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? "text-primary animate-scale-in" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center px-1 border-2 border-background">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

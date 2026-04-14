import { useState } from "react";
import { Search, MessageCircle, ShieldCheck, Filter, Plus, Pin, BellOff, X, Users } from "lucide-react";

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  verified: boolean;
  role: "landlord" | "tenant" | "agent" | "service" | "host";
  pinned?: boolean;
  muted?: boolean;
  property?: string;
}

interface ChatListProps {
  onOpenChat: (contact: ChatContact) => void;
}

const contacts: ChatContact[] = [
  { id: "1", name: "John Kamau", avatar: "JK", lastMessage: "Saturday at 10 AM works perfectly. I'll send you the exact location pin.", time: "10:35 AM", unread: 1, online: true, verified: true, role: "landlord", pinned: true, property: "3BR Kilimani" },
  { id: "2", name: "Mary Wanjiku", avatar: "MW", lastMessage: "The apartment is ready for viewing. Please bring your ID.", time: "Yesterday", unread: 0, online: false, verified: true, role: "landlord", property: "2BR Westlands" },
  { id: "3", name: "SwiftMovers KE", avatar: "🚛", lastMessage: "We can move you on Friday morning. Confirmed!", time: "Mon", unread: 3, online: true, verified: true, role: "service" },
  { id: "4", name: "Grace Njeri", avatar: "GN", lastMessage: "Is the deposit negotiable?", time: "Sun", unread: 0, online: false, verified: false, role: "tenant", property: "Studio Westlands" },
  { id: "5", name: "KejaPrime Agency", avatar: "KP", lastMessage: "We have 3 new listings in Kilimani matching your budget.", time: "Sat", unread: 2, online: true, verified: true, role: "agent" },
  { id: "6", name: "David Ochieng", avatar: "DO", lastMessage: "Check-in is at 2 PM. I'll leave the keys with the guard.", time: "Fri", unread: 0, online: false, verified: true, role: "host", property: "Beach View Nyali" },
  { id: "7", name: "CleanPro Solutions", avatar: "🧹", lastMessage: "Deep cleaning done! Photos attached.", time: "Thu", unread: 0, online: false, verified: true, role: "service", muted: true },
  { id: "8", name: "Peter Mutua", avatar: "PM", lastMessage: "I'll take the apartment. When can we sign?", time: "Wed", unread: 0, online: false, verified: false, role: "tenant", property: "1BR South B" },
];

type FilterType = "all" | "unread" | "landlords" | "services";

const ChatList = ({ onOpenChat }: ChatListProps) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "landlords", label: "Landlords" },
    { key: "services", label: "Services" },
  ];

  const filtered = contacts
    .filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q) || c.property?.toLowerCase().includes(q);
      }
      return true;
    })
    .filter((c) => {
      if (filter === "unread") return c.unread > 0;
      if (filter === "landlords") return c.role === "landlord" || c.role === "agent" || c.role === "host";
      if (filter === "services") return c.role === "service";
      return true;
    })
    .sort((a, b) => (a.pinned ? -1 : 0) - (b.pinned ? -1 : 0));

  const totalUnread = contacts.reduce((s, c) => s + c.unread, 0);

  const roleColor = (role: string) => {
    switch (role) {
      case "landlord": return "bg-primary/10 text-primary";
      case "agent": return "bg-purple-100 text-purple-700";
      case "service": return "bg-accent/10 text-accent-foreground";
      case "host": return "bg-trust/10 text-trust";
      case "tenant": return "bg-secondary text-muted-foreground";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="px-4 pt-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Messages</h1>
            {totalUnread > 0 && (
              <p className="text-xs text-muted-foreground">{totalUnread} unread message{totalUnread > 1 ? "s" : ""}</p>
            )}
          </div>
          <button className="w-10 h-10 rounded-xl gradient-trust flex items-center justify-center active:scale-95 transition-transform">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chats, people, properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card card-shadow text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-card card-shadow text-muted-foreground"
              }`}
            >
              {f.label}
              {f.key === "unread" && totalUnread > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-foreground/20 text-[9px]">{totalUnread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="px-4 space-y-1.5">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No conversations found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}

        {filtered.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onOpenChat(chat)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform relative"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                chat.avatar.length > 2 ? "bg-secondary text-lg" : "bg-primary/10"
              }`}>
                {chat.avatar.length > 2 ? (
                  <span>{chat.avatar}</span>
                ) : (
                  <span className="text-sm font-semibold text-primary">{chat.avatar}</span>
                )}
              </div>
              {chat.online && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-trust border-2 border-card" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  {chat.pinned && <Pin className="w-3 h-3 text-primary shrink-0 rotate-45" />}
                  <h3 className="text-sm font-semibold truncate">{chat.name}</h3>
                  {chat.verified && <ShieldCheck className="w-3.5 h-3.5 text-trust shrink-0" />}
                  {chat.muted && <BellOff className="w-3 h-3 text-muted-foreground shrink-0" />}
                </div>
                <span className={`text-[10px] shrink-0 ml-2 ${chat.unread > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {chat.time}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${roleColor(chat.role)}`}>
                  {chat.role}
                </span>
                {chat.property && (
                  <span className="text-[10px] text-muted-foreground truncate">· {chat.property}</span>
                )}
              </div>
              <p className={`text-xs truncate mt-0.5 ${chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {chat.lastMessage}
              </p>
            </div>

            {/* Unread badge */}
            {chat.unread > 0 && (
              <div className="w-5 h-5 rounded-full gradient-trust flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-primary-foreground">{chat.unread}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
export type { ChatContact };

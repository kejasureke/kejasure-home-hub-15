import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Search, MessageCircle, ShieldCheck, Filter, Plus, Pin, BellOff, X, Users, Archive, Bell, EyeOff, Ban, Trash2 } from "lucide-react";
import PullToRefresh from "./PullToRefresh";
import { useHardwareBack } from "@/hooks/useHardwareBack";
import { useLongPress } from "@/hooks/useLongPress";
import { haptic } from "@/lib/despia";
import EmptyIllustration from "./EmptyIllustration";

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

const roleColorStatic = (role: string) => {
  switch (role) {
    case "landlord": return "bg-primary/10 text-primary";
    case "agent": return "bg-purple-100 text-purple-700";
    case "service": return "bg-accent/10 text-accent-foreground";
    case "host": return "bg-trust/10 text-trust";
    case "tenant": return "bg-secondary text-muted-foreground";
    default: return "bg-secondary text-muted-foreground";
  }
};

const ChatRowButton = ({
  chat,
  isMuted,
  isUnread,
  onOpen,
  onLongPress,
}: {
  chat: ChatContact;
  isMuted: boolean;
  isUnread: boolean;
  onOpen: () => void;
  onLongPress: () => void;
}) => {
  const lp = useLongPress(onLongPress, { delay: 480 });
  const displayUnread = chat.unread > 0 ? chat.unread : isUnread ? 1 : 0;
  return (
    <button
      onClick={() => { if (!lp.didFire()) onOpen(); }}
      {...lp.handlers}
      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform relative"
    >
      <div className="relative shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${chat.avatar.length > 2 ? "bg-secondary text-lg" : "bg-primary/10"}`}>
          {chat.avatar.length > 2 ? <span>{chat.avatar}</span> : <span className="text-sm font-semibold text-primary">{chat.avatar}</span>}
        </div>
        {chat.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-trust border-2 border-card" />}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {chat.pinned && <Pin className="w-3 h-3 text-primary shrink-0 rotate-45" />}
            <h3 className="text-sm font-semibold truncate">{chat.name}</h3>
            {chat.verified && <ShieldCheck className="w-3.5 h-3.5 text-trust shrink-0" />}
            {(chat.muted || isMuted) && <BellOff className="w-3 h-3 text-muted-foreground shrink-0" />}
          </div>
          <span className={`text-[10px] shrink-0 ml-2 ${displayUnread > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            {chat.time}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${roleColorStatic(chat.role)}`}>{chat.role}</span>
          {chat.property && <span className="text-[10px] text-muted-foreground truncate">· {chat.property}</span>}
        </div>
        <p className={`text-xs truncate mt-0.5 ${displayUnread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
          {chat.lastMessage}
        </p>
      </div>
      {displayUnread > 0 && (
        <div className="w-5 h-5 rounded-full gradient-trust flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-primary-foreground">{displayUnread > 9 ? "9+" : displayUnread}</span>
        </div>
      )}
    </button>
  );
};

const ChatList = ({ onOpenChat }: ChatListProps) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [longPressed, setLongPressed] = useState<ChatContact | null>(null);
  const [mutedIds, setMutedIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("kejasure_muted_chats") || "[]")); } catch { return new Set(); }
  });
  const [markedUnread, setMarkedUnread] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("kejasure_marked_unread") || "[]")); } catch { return new Set(); }
  });
  const [, tick] = useState(0);
  // Auto-tick every 30s so "just now / Xm ago" style timestamps stay fresh.
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);
  const [archived, setArchived] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("kejasure_archived_chats") || "[]")); } catch { return new Set(); }
  });

  const persistSet = (key: string, s: Set<string>) => {
    try { localStorage.setItem(key, JSON.stringify([...s])); } catch {}
  };

  const toggleMute = (id: string) => {
    setMutedIds((prev) => {
      const next = new Set(prev);
      const wasMuted = next.has(id);
      if (wasMuted) next.delete(id); else next.add(id);
      persistSet("kejasure_muted_chats", next);
      haptic("success");
      toast(wasMuted ? "Chat unmuted" : "Chat muted", { description: wasMuted ? "You'll get notifications again" : "Notifications silenced" });
      return next;
    });
  };

  const toggleUnread = (id: string) => {
    setMarkedUnread((prev) => {
      const next = new Set(prev);
      const was = next.has(id);
      if (was) next.delete(id); else next.add(id);
      persistSet("kejasure_marked_unread", next);
      haptic("light");
      toast(was ? "Marked as read" : "Marked as unread");
      return next;
    });
  };

  const blockChat = (id: string) => {
    haptic("warning");
    setArchived((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistSet("kejasure_archived_chats", next);
      return next;
    });
    toast("User blocked", { description: "You won't receive messages from them" });
  };

  const archiveChat = (id: string) => {
    setArchived((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem("kejasure_archived_chats", JSON.stringify([...next])); } catch {}
      return next;
    });
    haptic("success");
    toast("Chat archived", {
      action: {
        label: "Undo",
        onClick: () => setArchived((p) => {
          const n = new Set(p); n.delete(id);
          try { localStorage.setItem("kejasure_archived_chats", JSON.stringify([...n])); } catch {}
          return n;
        }),
      },
    });
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "landlords", label: "Landlords" },
    { key: "services", label: "Services" },
  ];

  const filtered = contacts
    .filter((c) => !archived.has(c.id))
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

  const handleRefresh = async () => {
    await new Promise((r) => setTimeout(r, 700));
    toast("Chats refreshed");
  };

  useHardwareBack(showNewChat, () => { setShowNewChat(false); setNewChatSearch(""); });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="pb-32">
      {/* Header */}
      <div className="px-4 pt-safe mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Messages</h1>
            {totalUnread > 0 && (
              <p className="text-xs text-muted-foreground">{totalUnread} unread message{totalUnread > 1 ? "s" : ""}</p>
            )}
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="w-10 h-10 rounded-xl gradient-trust flex items-center justify-center active:scale-95 transition-transform"
          >
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
          <div className="flex flex-col items-center justify-center py-12">
            <EmptyIllustration variant="chats" className="w-28 h-28 mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">No conversations yet</p>
            <p className="text-xs text-muted-foreground text-center px-6">
              Chats with landlords, hosts and service pros will appear here.
            </p>
          </div>
        )}

        {filtered.map((chat) => (
          <SwipeableChatRow key={chat.id} onArchive={() => archiveChat(chat.id)}>
            <ChatRowButton
              chat={chat}
              isMuted={mutedIds.has(chat.id)}
              isUnread={markedUnread.has(chat.id)}
              onOpen={() => {
                if (markedUnread.has(chat.id)) toggleUnread(chat.id);
                onOpenChat(chat);
              }}
              onLongPress={() => setLongPressed(chat)}
            />
          </SwipeableChatRow>
        ))}
      </div>

      {/* Long-press action sheet */}
      {longPressed && (
        <div
          className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm flex items-end animate-fade-in"
          onClick={() => setLongPressed(null)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-card rounded-t-3xl safe-bottom pb-3 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            <div className="px-5 py-2">
              <p className="text-sm font-bold text-foreground truncate">{longPressed.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{longPressed.property || longPressed.role}</p>
            </div>
            <div className="px-2 pb-1">
              {[
                {
                  icon: mutedIds.has(longPressed.id) ? Bell : BellOff,
                  label: mutedIds.has(longPressed.id) ? "Unmute conversation" : "Mute conversation",
                  onClick: () => { toggleMute(longPressed.id); setLongPressed(null); },
                },
                {
                  icon: EyeOff,
                  label: markedUnread.has(longPressed.id) ? "Mark as read" : "Mark as unread",
                  onClick: () => { toggleUnread(longPressed.id); setLongPressed(null); },
                },
                {
                  icon: Archive,
                  label: "Archive",
                  onClick: () => { archiveChat(longPressed.id); setLongPressed(null); },
                },
                {
                  icon: Ban,
                  label: "Block user",
                  destructive: true,
                  onClick: () => { blockChat(longPressed.id); setLongPressed(null); },
                },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.label}
                    onClick={a.onClick}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl active:bg-secondary/60 ${a.destructive ? "text-destructive" : "text-foreground"}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{a.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setLongPressed(null)}
              className="mx-4 mt-1 mb-1 py-3 rounded-xl bg-secondary text-sm font-semibold text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-w-lg bg-card rounded-t-3xl card-shadow max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 pt-5 pb-3">
              <h2 className="text-lg font-bold text-foreground">New Message</h2>
              <button
                onClick={() => { setShowNewChat(false); setNewChatSearch(""); }}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
              {contacts
                .filter((c) => {
                  if (!newChatSearch) return true;
                  const q = newChatSearch.toLowerCase();
                  return c.name.toLowerCase().includes(q) || c.role.includes(q);
                })
                .map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setShowNewChat(false);
                      setNewChatSearch("");
                      onOpenChat(contact);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary active:scale-[0.98] transition-all"
                  >
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        contact.avatar.length > 2 ? "bg-secondary text-base" : "bg-primary/10"
                      }`}>
                        {contact.avatar.length > 2 ? (
                          <span>{contact.avatar}</span>
                        ) : (
                          <span className="text-xs font-semibold text-primary">{contact.avatar}</span>
                        )}
                      </div>
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-trust border-2 border-card" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground">{contact.name}</span>
                        {contact.verified && <ShieldCheck className="w-3.5 h-3.5 text-trust" />}
                      </div>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleColor(contact.role)}`}>
                        {contact.role}
                      </span>
                    </div>
                  </button>
                ))}

              {contacts.filter((c) => {
                if (!newChatSearch) return true;
                return c.name.toLowerCase().includes(newChatSearch.toLowerCase());
              }).length === 0 && (
                <div className="flex flex-col items-center py-10">
                  <Users className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No contacts found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </PullToRefresh>
  );
};

const SwipeableChatRow = ({ children, onArchive }: { children: React.ReactNode; onArchive: () => void }) => {
  const [dx, setDx] = useState(0);
  const startX = useRef<number | null>(null);

  const onStart = (x: number) => { startX.current = x; };
  const onMove = (x: number) => {
    if (startX.current == null) return;
    const delta = Math.min(0, x - startX.current);
    setDx(Math.max(delta, -120));
  };
  const onEnd = () => {
    if (dx < -80) {
      setDx(-400);
      setTimeout(onArchive, 180);
    } else {
      setDx(0);
    }
    startX.current = null;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 flex items-center justify-end pr-5 bg-accent/90 rounded-2xl">
        <div className="flex items-center gap-1.5 text-accent-foreground">
          <Archive className="w-4 h-4" />
          <span className="text-xs font-bold">Archive</span>
        </div>
      </div>
      <div
        style={{ transform: `translateX(${dx}px)`, transition: startX.current == null ? "transform 0.2s ease-out" : "none" }}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default ChatList;
export type { ChatContact };

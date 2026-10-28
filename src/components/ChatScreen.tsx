import { ArrowLeft, Send, Paperclip, Phone, MoreVertical, Check, CheckCheck, ShieldCheck, Image, Camera, X, Smile, Mic } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { pushGlobalAlert } from "@/hooks/useInAppNotifications";
import { scanMessage } from "@/lib/trust";
import { ShieldAlert } from "lucide-react";
import { haptic } from "@/lib/despia";
import { supabase } from "@/integrations/supabase/client";

interface ChatScreenProps {
  onBack: () => void;
  contactName?: string;
  contactRole?: string;
  contactOnline?: boolean;
  contactVerified?: boolean;
  propertyContext?: string;
  conversationId?: string;
}

interface Message {
  id: string;
  text?: string;
  image?: string;
  sender: "me" | "other";
  time: string;
  status?: "sending" | "sent" | "delivered" | "seen";
  replyTo?: string;
}

const isUuid = (v?: string) => !!v && /^[0-9a-f-]{36}$/i.test(v);
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true });

const ChatScreen = ({ onBack, contactName = "KejaSure member", contactRole, contactOnline, contactVerified = false, propertyContext, conversationId }: ChatScreenProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const canChat = isUuid(conversationId);
  const [isTyping, setIsTyping] = useState(false);
  const [safetyDismissed, setSafetyDismissed] = useState(false);
  const [showPhoneReveal, setShowPhoneReveal] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [lastSeen] = useState(propertyContext ? "In-app chat" : "In-app chat");
  const [showJumpPill, setShowJumpPill] = useState(false);
  const [newIncoming, setNewIncoming] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load real messages + live updates
  useEffect(() => {
    if (!canChat) return;
    let cancelled = false;
    let ch: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setMyId(user.id);
      const toMsg = (r: any): Message => ({
        id: r.id,
        text: r.body ?? undefined,
        image: r.attachment_url ?? undefined,
        sender: r.sender_id === user.id ? "me" : "other",
        time: fmtTime(r.created_at),
        status: r.sender_id === user.id ? (r.read_at ? "seen" : "sent") : undefined,
      });
      const { data } = await supabase.from("messages").select("*").eq("conversation_id", conversationId!).order("created_at").limit(500);
      if (!cancelled && data) setMessages(data.map(toMsg));
      await supabase.from("messages").update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId!).neq("sender_id", user.id).is("read_at", null);
      ch = supabase
        .channel(`chat-${conversationId}-${Math.random().toString(36).slice(2)}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (p) => {
          const r: any = p.new;
          if (!r?.id) return;
          if (p.eventType === "INSERT") {
            setMessages((prev) => prev.some((m) => m.id === r.id) ? prev : [...prev, toMsg(r)]);
            if (r.sender_id !== user.id) {
              haptic("light");
              supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", r.id).then(() => {});
            }
          } else if (p.eventType === "UPDATE") {
            setMessages((prev) => prev.map((m) => (m.id === r.id ? toMsg(r) : m)));
          }
        })
        .subscribe();
      const { data: ph } = await supabase.rpc("chat_contact_phone", { _conversation_id: conversationId! });
      if (!cancelled && ph) setPhone(ph as string);
    })();
    return () => { cancelled = true; if (ch) supabase.removeChannel(ch); };
  }, [conversationId, canChat]);

  const initials = contactName.split(" ").map((n) => n[0]).join("");

  const isNearBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  useEffect(() => {
    if (isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setShowJumpPill(false);
      setNewIncoming(0);
    } else {
      // A new message arrived off-screen
      const last = messages[messages.length - 1];
      if (last && last.sender === "other") {
        setShowJumpPill(true);
        setNewIncoming((n) => n + 1);
      }
    }
  }, [messages, isTyping]);

  const onMessagesScroll = () => {
    if (isNearBottom()) {
      setShowJumpPill(false);
      setNewIncoming(0);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !canChat || !myId) return;
    const text = message.trim();
    const tempId = `tmp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, text, sender: "me", time: fmtTime(new Date().toISOString()), status: "sending" }]);
    setMessage("");
    const { data, error } = await supabase.from("messages")
      .insert({ conversation_id: conversationId!, sender_id: myId, body: text }).select().single();
    if (error || !data) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setMessage(text);
      haptic("error");
      return;
    }
    haptic("light");
    setMessages((prev) => {
      const withoutTemp = prev.filter((m) => m.id !== tempId);
      return withoutTemp.some((m) => m.id === data.id) ? withoutTemp
        : [...withoutTemp, { id: data.id, text, sender: "me", time: fmtTime(data.created_at), status: "sent" }];
    });
  };

  const handleImageSelect = () => {
    setShowAttachMenu(false);
  };

  const handlePhoneReveal = () => {
    if (!phone) return;
    setPhoneRevealed(true);
    setShowPhoneReveal(false);
  };

  const quickChips = contactRole === "service"
    ? ["📅 Schedule Service", "💰 Get Quote", "📍 Share Location", "✅ Confirm Booking"]
    : contactRole === "host"
    ? ["📅 Confirm Dates", "🔑 Check-in Info", "📍 Share Location", "⭐ Rate Stay"]
    : ["📅 Confirm Viewing", "📍 Share Location", "💰 Discuss Price", "✅ Accept Booking", "📸 Request Photos", "🔑 Move-in Date"];

  const safetySignals = safetyDismissed
    ? []
    : Array.from(
        new Map(
          messages
            .slice(-8)
            .filter((m) => m.sender === "other" && m.text)
            .flatMap((m) => scanMessage(m.text!))
            .map((s) => [s.kind, s]),
        ).values(),
      );

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-3 pt-safe-compact border-b border-border glass-surface">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="relative">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            initials.length <= 2 ? "bg-primary/10" : "bg-secondary"
          }`}>
            <span className="text-sm font-semibold text-primary">{initials}</span>
          </div>
          {contactOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-trust border-2 border-card" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold">{contactName}</h3>
            {contactVerified && <ShieldCheck className="w-3.5 h-3.5 text-trust" />}
          </div>
          <p className={`text-xs ${contactOnline ? "text-trust" : "text-muted-foreground"}`}>{lastSeen}</p>
        </div>
        <button onClick={() => setShowPhoneReveal(true)} className="p-2">
          <Phone className={`w-4.5 h-4.5 ${phoneRevealed ? "text-trust" : "text-muted-foreground"}`} />
        </button>
        <button className="p-2">
          <MoreVertical className="w-4.5 h-4.5 text-muted-foreground" />
        </button>
      </div>

      {/* Phone revealed banner */}
      {phoneRevealed && phone && (
        <div className="bg-trust/10 border-b border-trust/20 animate-fade-in">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-trust" />
              <span className="text-xs font-medium text-trust">{phone}</span>
            </div>
            <a
              href={`tel:${phone}`}
              onClick={() => haptic("light")}
              className="px-3 py-1.5 rounded-full bg-trust text-[11px] font-bold text-primary-foreground active:scale-95 transition-transform"
            >
              Call
            </a>
          </div>
          <p className="px-4 pb-2 text-[10px] text-muted-foreground">
            Keep booking updates in KejaSure — only in-app connections count towards reviews and trust.
          </p>
        </div>
      )}

      {/* Property context banner */}
      {propertyContext && (
        <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 flex items-center gap-2">
          <span className="text-xs">🏠</span>
          <span className="text-xs font-medium text-foreground">Re: {propertyContext}</span>
        </div>
      )}

      {/* Safety signal banner */}
      {safetySignals.length > 0 && (
        <div className="px-4 py-2.5 bg-destructive/10 border-b border-destructive/20 animate-fade-in">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] font-bold text-destructive">Careful with this chat</p>
              <ul className="mt-0.5 space-y-0.5">
                {safetySignals.map((s) => (
                  <li key={s.kind} className="text-[10px] text-muted-foreground">• {s.label}</li>
                ))}
              </ul>
              <p className="text-[10px] text-muted-foreground mt-1">
                KejaSure never handles rent or deposits. Keep chatting here and view the place before you agree to anything.
              </p>
            </div>
            <button onClick={() => setSafetyDismissed(true)} className="p-1 text-muted-foreground shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} onScroll={onMessagesScroll} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative">
        {showJumpPill && (
          <button
            onClick={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              setShowJumpPill(false);
              setNewIncoming(0);
            }}
            className="fixed left-1/2 -translate-x-1/2 bottom-24 z-30 px-3 py-1.5 rounded-full gradient-trust text-primary-foreground text-[11px] font-semibold shadow-lg flex items-center gap-1.5 animate-fade-in"
          >
            <span>↓ New message{newIncoming > 1 ? `s (${newIncoming})` : ""}</span>
          </button>
        )}
        {/* Quick action chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setMessage(chip.replace(/^[^\s]+\s/, ""))}
              className="shrink-0 px-3 py-1.5 rounded-full bg-primary/5 text-xs font-medium text-primary border border-primary/15 active:scale-95 transition-transform"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Date separator */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] text-muted-foreground font-medium">Today</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {(() => {
          // Find the first inbound message after my last sent message → show "Unread" divider
          const lastMineIdx = [...messages].map((m, i) => ({ m, i })).reverse().find(({ m }) => m.sender === "me")?.i ?? -1;
          const firstUnreadIdx = messages.findIndex((m, i) => m.sender === "other" && i > lastMineIdx);
          return messages.map((msg, i) => (
            <div key={msg.id}>
              {i === firstUnreadIdx && firstUnreadIdx > 0 && (
                <div className="flex items-center gap-3 py-1 animate-fade-in">
                  <div className="flex-1 h-px bg-accent/30" />
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Unread messages</span>
                  <div className="flex-1 h-px bg-accent/30" />
                </div>
              )}
              <div className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} animate-fade-in`}>
                <div className={`max-w-[80%] ${
                  msg.image ? "rounded-2xl overflow-hidden" : `px-4 py-2.5 rounded-2xl ${
                    msg.sender === "me"
                      ? "gradient-trust text-primary-foreground rounded-br-md"
                      : "bg-card card-shadow text-foreground rounded-bl-md"
                  }`
                }`}>
                  {msg.image ? (
                    <div className="relative">
                      <div className="w-48 h-48 bg-secondary rounded-2xl flex items-center justify-center">
                        <Image className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className={`absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full ${
                        msg.sender === "me" ? "bg-foreground/30" : "bg-card/80"
                      }`}>
                        <span className="text-[10px] text-card">{msg.time}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className={`flex items-center gap-1 mt-1 ${msg.sender === "me" ? "justify-end" : ""}`}>
                        <span className={`text-[10px] ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {msg.time}
                        </span>
                        {msg.status === "sending" && (
                          <div className="w-3 h-3 rounded-full border border-primary-foreground/40 border-t-transparent animate-spin" />
                        )}
                        {msg.status === "sent" && <Check className="w-3 h-3 text-primary-foreground/50" />}
                        {msg.status === "delivered" && <CheckCheck className="w-3 h-3 text-primary-foreground/50" />}
                        {msg.status === "seen" && <CheckCheck className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ));
        })()}


        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="px-4 py-3 rounded-2xl bg-card card-shadow rounded-bl-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.6s" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.6s" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.6s" }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{contactName.split(" ")[0]} is typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attachment menu */}
      {showAttachMenu && (
        <div className="px-4 py-3 border-t border-border bg-card animate-fade-in">
          <div className="flex gap-4 justify-center">
            <button onClick={handleImageSelect} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Image className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground">Gallery</span>
            </button>
            <button onClick={handleImageSelect} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-trust/10 flex items-center justify-center">
                <Camera className="w-5 h-5 text-trust" />
              </div>
              <span className="text-[10px] text-muted-foreground">Camera</span>
            </button>
          </div>
        </div>
      )}

      {!canChat && (
        <p className="px-4 py-2 text-[11px] text-center text-muted-foreground border-t border-border">
          Chat opens once you send a booking request to this provider.
        </p>
      )}
      {/* Input */}
      <div className="p-4 border-t border-border glass-surface safe-bottom">
        <div className="flex items-center gap-2 bg-secondary rounded-2xl px-3 py-1">
          <button className="p-2" onClick={() => setShowAttachMenu(!showAttachMenu)}>
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            disabled={!canChat}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 py-2.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {message.trim() ? (
            <button onClick={sendMessage} className="p-2 rounded-xl gradient-trust active:scale-95 transition-transform">
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          ) : (
            <button className="p-2">
              <Mic className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Phone Reveal Modal */}
      {showPhoneReveal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={() => setShowPhoneReveal(false)}>
          <div className="mx-4 w-full max-w-sm bg-card rounded-3xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full gradient-trust mx-auto mb-3 flex items-center justify-center">
                <Phone className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold">Reveal Phone Number</h3>
              <p className="text-xs text-muted-foreground mt-1">Contact {contactName} directly</p>
            </div>
            <div className="p-4 rounded-2xl bg-trust/5 border border-trust/20 mb-3">
              <p className="text-xs text-muted-foreground text-center">
                Phone numbers are revealed after booking confirmation or premium unlock. This ensures trust and reduces spam for both parties.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 mb-5 space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-destructive" />
                <p className="text-xs font-bold text-foreground">Before you share your number</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Keep the conversation here. KejaSure never handles rent or deposits, and only in-app bookings count towards reviews, ratings and your trust level.
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Never send money before viewing the place in person.
              </p>
            </div>
            <div className="space-y-2">
              <button onClick={handlePhoneReveal} disabled={!phone} className="disabled:opacity-50 w-full py-3.5 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-transform">
                {phone ? "✓ Reveal Number (Booking Accepted)" : "Unlocks once a booking is accepted"}
              </button>
              <button onClick={() => setShowPhoneReveal(false)} className="w-full py-3 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;

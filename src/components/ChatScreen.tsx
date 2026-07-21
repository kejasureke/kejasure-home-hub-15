import { ArrowLeft, Send, Paperclip, Phone, MoreVertical, Check, CheckCheck, ShieldCheck, Image, Camera, X, Smile, Mic } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { pushGlobalAlert } from "@/hooks/useInAppNotifications";

interface ChatScreenProps {
  onBack: () => void;
  contactName?: string;
  contactRole?: string;
  contactOnline?: boolean;
  contactVerified?: boolean;
  propertyContext?: string;
}

interface Message {
  id: number;
  text?: string;
  image?: string;
  sender: "me" | "other";
  time: string;
  status?: "sending" | "sent" | "delivered" | "seen";
  replyTo?: string;
}

const conversationsByContact: Record<string, Message[]> = {
  "John Kamau": [
    { id: 1, text: "Hi! I'm interested in the 3BR apartment in Kilimani. Is it still available?", sender: "me", time: "10:30 AM", status: "seen" },
    { id: 2, text: "Hello! Yes, it's still available. Would you like to schedule a viewing?", sender: "other", time: "10:32 AM" },
    { id: 3, text: "That would be great! Is Saturday morning okay?", sender: "me", time: "10:33 AM", status: "seen" },
    { id: 4, text: "Saturday at 10 AM works perfectly. I'll send you the exact location pin.", sender: "other", time: "10:35 AM" },
  ],
  "Mary Wanjiku": [
    { id: 1, text: "Hello, I saw your 2BR listing in Westlands. What floor is it on?", sender: "me", time: "2:15 PM", status: "seen" },
    { id: 2, text: "Hi! It's on the 5th floor with a great view of Karura Forest.", sender: "other", time: "2:20 PM" },
    { id: 3, text: "The apartment is ready for viewing. Please bring your ID.", sender: "other", time: "3:00 PM" },
  ],
  "SwiftMovers KE": [
    { id: 1, text: "Hi, I need moving services from Kilimani to Karen. 2BR apartment.", sender: "me", time: "9:00 AM", status: "seen" },
    { id: 2, text: "Hello! We can help with that. When do you need to move?", sender: "other", time: "9:05 AM" },
    { id: 3, text: "This Friday morning if possible.", sender: "me", time: "9:07 AM", status: "seen" },
    { id: 4, text: "We can move you on Friday morning. Confirmed! 🚛", sender: "other", time: "9:10 AM" },
  ],
  "Grace Njeri": [
    { id: 1, text: "Hi, I'm Grace. Is the Studio in Westlands still available?", sender: "other", time: "11:00 AM" },
    { id: 2, text: "Yes it is! Would you like to view it?", sender: "me", time: "11:15 AM", status: "delivered" },
    { id: 3, text: "Is the deposit negotiable?", sender: "other", time: "11:30 AM" },
  ],
  "KejaPrime Agency": [
    { id: 1, text: "We have 3 new listings in Kilimani matching your budget.", sender: "other", time: "10:00 AM" },
  ],
  "David Ochieng": [
    { id: 1, text: "I'd like to book your Beach View stay for next weekend.", sender: "me", time: "4:00 PM", status: "seen" },
    { id: 2, text: "It's available! Booking confirmed for Fri-Sun.", sender: "other", time: "4:10 PM" },
    { id: 3, text: "Check-in is at 2 PM. I'll leave the keys with the guard.", sender: "other", time: "4:12 PM" },
  ],
};

const autoReplies: Record<string, string[]> = {
  "John Kamau": ["Great, see you then!", "I'll prepare the documents for viewing.", "Let me know if you have any other questions."],
  "Mary Wanjiku": ["The rent includes water and garbage collection.", "Parking is available at KES 3,000/month extra.", "Happy to help!"],
  "SwiftMovers KE": ["We'll send 2 trucks and 4 movers.", "Packing materials are included in the price.", "We also offer storage services."],
  default: ["Thanks for your message! I'll get back to you shortly.", "Sure, let me check and confirm.", "Sounds good! 👍"],
};

const ChatScreen = ({ onBack, contactName = "John Kamau", contactRole, contactOnline, contactVerified = true, propertyContext }: ChatScreenProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(conversationsByContact[contactName] || conversationsByContact["John Kamau"]);
  const [isTyping, setIsTyping] = useState(false);
  const [showPhoneReveal, setShowPhoneReveal] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [lastSeen] = useState(contactOnline ? "Online" : "Last seen today, 2:45 PM");
  const [showJumpPill, setShowJumpPill] = useState(false);
  const [newIncoming, setNewIncoming] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyIdx = useRef(0);

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

  const sendMessage = () => {
    if (!message.trim()) return;
    const now = new Date().toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true });

    const newMsg: Message = {
      id: Date.now(),
      text: message,
      sender: "me",
      time: now,
      status: "sending",
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage("");

    // Simulate status progression
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => m.id === newMsg.id ? { ...m, status: "sent" as const } : m));
    }, 500);
    setTimeout(() => {
      setMessages((prev) => prev.map((m) => m.id === newMsg.id ? { ...m, status: "delivered" as const } : m));
    }, 1200);

    // Simulate typing then reply
    setTimeout(() => setIsTyping(true), 1500);
    const delay = 2500 + Math.random() * 2000;
    setTimeout(() => {
      setIsTyping(false);
      const replies = autoReplies[contactName] || autoReplies["default"];
      const replyText = replies[replyIdx.current % replies.length];
      replyIdx.current++;

      setMessages((prev) => {
        const updated = prev.map((m) => m.id === newMsg.id ? { ...m, status: "seen" as const } : m);
        return [
          ...updated,
          {
            id: Date.now() + 1,
            text: replyText,
            sender: "other" as const,
            time: new Date().toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true }),
          },
        ];
      });

      // Fire a global alert for the incoming host/agent message when the user
      // is not actively viewing this chat (backgrounded tab / minimized app).
      if (typeof document !== "undefined" && document.hidden) {
        const roleLabel = contactRole === "host" ? "host" : contactRole === "service" ? "provider" : "landlord";
        pushGlobalAlert({
          type: "message",
          title: `New message from ${contactName || "your " + roleLabel}`,
          body: replyText,
          action: "open-chats",
        });
      }
    }, delay);
  };

  const handleImageSelect = () => {
    const newMsg: Message = {
      id: Date.now(),
      image: "/placeholder.svg",
      sender: "me",
      time: new Date().toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true }),
      status: "sent",
    };
    setMessages((prev) => [...prev, newMsg]);
    setShowAttachMenu(false);
  };

  const handlePhoneReveal = () => {
    setPhoneRevealed(true);
    setShowPhoneReveal(false);
  };

  const quickChips = contactRole === "service"
    ? ["📅 Schedule Service", "💰 Get Quote", "📍 Share Location", "✅ Confirm Booking"]
    : contactRole === "host"
    ? ["📅 Confirm Dates", "🔑 Check-in Info", "📍 Share Location", "⭐ Rate Stay"]
    : ["📅 Confirm Viewing", "📍 Share Location", "💰 Discuss Price", "✅ Accept Booking", "📸 Request Photos", "🔑 Move-in Date"];

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
      {phoneRevealed && (
        <div className="px-4 py-2 bg-trust/10 border-b border-trust/20 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-trust" />
            <span className="text-xs font-medium text-trust">+254 712 345 678</span>
          </div>
          <a href="tel:+254712345678" className="text-xs font-semibold text-trust">Call</a>
        </div>
      )}

      {/* Property context banner */}
      {propertyContext && (
        <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 flex items-center gap-2">
          <span className="text-xs">🏠</span>
          <span className="text-xs font-medium text-foreground">Re: {propertyContext}</span>
        </div>
      )}

      {/* Priority alert banner */}
      <div className="px-4 py-2 bg-gold/10 border-b border-gold/20 flex items-center gap-2">
        <span className="text-xs">⚡</span>
        <span className="text-xs font-medium text-gold-foreground">Priority tenant – your messages are highlighted</span>
      </div>

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

      {/* Input */}
      <div className="p-4 border-t border-border glass-surface safe-bottom">
        <div className="flex items-center gap-2 bg-secondary rounded-2xl px-3 py-1">
          <button className="p-2" onClick={() => setShowAttachMenu(!showAttachMenu)}>
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
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
            <div className="p-4 rounded-2xl bg-trust/5 border border-trust/20 mb-5">
              <p className="text-xs text-muted-foreground text-center">
                Phone numbers are revealed after booking confirmation or premium unlock. This ensures trust and reduces spam for both parties.
              </p>
            </div>
            <div className="space-y-2">
              <button onClick={handlePhoneReveal} className="w-full py-3.5 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-transform">
                ✓ Reveal Number (Booking Accepted)
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

import { ArrowLeft, Send, Paperclip, Phone, MoreVertical, Check, CheckCheck, ShieldCheck, Image, Camera, X } from "lucide-react";
import { useState, useRef } from "react";

interface ChatScreenProps {
  onBack: () => void;
  contactName?: string;
}

interface Message {
  id: number;
  text?: string;
  image?: string;
  sender: "me" | "other";
  time: string;
  status?: "sent" | "delivered" | "seen";
}

const initialMessages: Message[] = [
  { id: 1, text: "Hi! I'm interested in the 3BR apartment in Kilimani. Is it still available?", sender: "me", time: "10:30 AM", status: "seen" },
  { id: 2, text: "Hello! Yes, it's still available. Would you like to schedule a viewing?", sender: "other", time: "10:32 AM" },
  { id: 3, text: "That would be great! Is Saturday morning okay?", sender: "me", time: "10:33 AM", status: "seen" },
  { id: 4, text: "Saturday at 10 AM works perfectly. I'll send you the exact location pin.", sender: "other", time: "10:35 AM" },
];

const ChatScreen = ({ onBack, contactName = "John Kamau" }: ChatScreenProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(true);
  const [showPhoneReveal, setShowPhoneReveal] = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = contactName.split(" ").map((n) => n[0]).join("");

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg: Message = {
      id: messages.length + 1,
      text: message,
      sender: "me",
      time: new Date().toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true }),
      status: "sent",
    };
    setMessages([...messages, newMsg]);
    setMessage("");

    // Simulate reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Thanks for your message! I'll get back to you shortly.",
          sender: "other",
          time: new Date().toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true }),
        },
      ]);
    }, 2000);
  };

  const handleImageSelect = () => {
    // Simulate image share
    const newMsg: Message = {
      id: messages.length + 1,
      image: "/placeholder.svg",
      sender: "me",
      time: new Date().toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit", hour12: true }),
      status: "sent",
    };
    setMessages([...messages, newMsg]);
    setShowAttachMenu(false);
  };

  const handlePhoneReveal = () => {
    setPhoneRevealed(true);
    setShowPhoneReveal(false);
  };

  const quickChips = [
    "📅 Confirm Viewing",
    "📍 Share Location",
    "💰 Discuss Price",
    "✅ Accept Booking",
    "📸 Request Photos",
    "🔑 Move-in Date",
  ];

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border glass-surface">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">{initials}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold">{contactName}</h3>
            <ShieldCheck className="w-3.5 h-3.5 text-trust" />
          </div>
          <p className="text-xs text-trust">Online now</p>
        </div>
        <button
          onClick={() => setShowPhoneReveal(true)}
          className="p-2"
        >
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

      {/* Priority alert banner */}
      <div className="px-4 py-2 bg-gold/10 border-b border-gold/20 flex items-center gap-2">
        <span className="text-xs">⚡</span>
        <span className="text-xs font-medium text-gold-foreground">Priority tenant – your messages are highlighted</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
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

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
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
                    {msg.status === "sent" && <Check className="w-3 h-3 text-primary-foreground/50" />}
                    {msg.status === "delivered" && <CheckCheck className="w-3 h-3 text-primary-foreground/50" />}
                    {msg.status === "seen" && <CheckCheck className="w-3 h-3 text-primary-foreground/70" />}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-card card-shadow rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
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
          <button onClick={sendMessage} className="p-2 rounded-xl gradient-trust">
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
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

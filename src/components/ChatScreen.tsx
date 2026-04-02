import { ArrowLeft, Send, Paperclip, Phone, MoreVertical, Check, CheckCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface ChatScreenProps {
  onBack: () => void;
}

const mockMessages = [
  { id: 1, text: "Hi! I'm interested in the 3BR apartment in Kilimani. Is it still available?", sender: "me", time: "10:30 AM", status: "seen" },
  { id: 2, text: "Hello! Yes, it's still available. Would you like to schedule a viewing?", sender: "other", time: "10:32 AM" },
  { id: 3, text: "That would be great! Is Saturday morning okay?", sender: "me", time: "10:33 AM", status: "seen" },
  { id: 4, text: "Saturday at 10 AM works perfectly. I'll send you the exact location pin.", sender: "other", time: "10:35 AM" },
];

const ChatScreen = ({ onBack }: ChatScreenProps) => {
  const [message, setMessage] = useState("");

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border glass-surface">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">JK</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold">John Kamau</h3>
            <ShieldCheck className="w-3.5 h-3.5 text-trust" />
          </div>
          <p className="text-xs text-trust">Online now</p>
        </div>
        <button className="p-2">
          <Phone className="w-4.5 h-4.5 text-muted-foreground" />
        </button>
        <button className="p-2">
          <MoreVertical className="w-4.5 h-4.5 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Quick actions */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {["📅 Confirm Viewing", "📍 Share Location", "💰 Discuss Price"].map((chip) => (
            <button key={chip} className="shrink-0 px-3 py-1.5 rounded-full bg-primary/5 text-xs font-medium text-primary border border-primary/15">
              {chip}
            </button>
          ))}
        </div>

        {mockMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
              msg.sender === "me"
                ? "gradient-trust text-primary-foreground rounded-br-md"
                : "bg-card card-shadow text-foreground rounded-bl-md"
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <div className={`flex items-center gap-1 mt-1 ${msg.sender === "me" ? "justify-end" : ""}`}>
                <span className={`text-[10px] ${msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {msg.time}
                </span>
                {msg.status === "seen" && <CheckCheck className="w-3 h-3 text-primary-foreground/70" />}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        <div className="flex justify-start">
          <div className="px-4 py-3 rounded-2xl bg-card card-shadow rounded-bl-md">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border glass-surface safe-bottom">
        <div className="flex items-center gap-2 bg-secondary rounded-2xl px-3 py-1">
          <button className="p-2">
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 py-2.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button className="p-2 rounded-xl gradient-trust">
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;

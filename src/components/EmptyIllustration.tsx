interface EmptyIllustrationProps {
  variant: "bookings" | "chats" | "favorites" | "search" | "notifications";
  className?: string;
}

/**
 * Warm, inline SVG illustrations for empty states.
 * Uses semantic tokens via currentColor + text-primary/text-muted-foreground.
 */
const EmptyIllustration = ({ variant, className = "w-32 h-32" }: EmptyIllustrationProps) => {
  const common = "w-full h-full";
  switch (variant) {
    case "bookings":
      return (
        <div className={className}>
          <svg viewBox="0 0 120 120" className={common} fill="none">
            <rect x="20" y="30" width="80" height="70" rx="10" className="fill-primary/10" />
            <rect x="20" y="30" width="80" height="18" rx="10" className="fill-primary/25" />
            <rect x="30" y="22" width="6" height="16" rx="3" className="fill-primary" />
            <rect x="84" y="22" width="6" height="16" rx="3" className="fill-primary" />
            <circle cx="45" cy="65" r="3" className="fill-primary" />
            <circle cx="60" cy="65" r="3" className="fill-primary/60" />
            <circle cx="75" cy="65" r="3" className="fill-primary/60" />
            <circle cx="45" cy="80" r="3" className="fill-primary/60" />
            <circle cx="60" cy="80" r="3" className="fill-accent" />
          </svg>
        </div>
      );
    case "chats":
      return (
        <div className={className}>
          <svg viewBox="0 0 120 120" className={common} fill="none">
            <rect x="15" y="25" width="70" height="45" rx="12" className="fill-primary/15" />
            <rect x="40" y="55" width="65" height="45" rx="12" className="fill-accent/20" />
            <circle cx="55" cy="77" r="2.5" className="fill-accent" />
            <circle cx="70" cy="77" r="2.5" className="fill-accent" />
            <circle cx="85" cy="77" r="2.5" className="fill-accent" />
          </svg>
        </div>
      );
    case "favorites":
      return (
        <div className={className}>
          <svg viewBox="0 0 120 120" className={common} fill="none">
            <path d="M60 95 L28 65 A16 16 0 0 1 60 45 A16 16 0 0 1 92 65 Z" className="fill-accent/20 stroke-accent" strokeWidth="2.5" />
            <circle cx="60" cy="60" r="4" className="fill-accent" />
          </svg>
        </div>
      );
    case "search":
      return (
        <div className={className}>
          <svg viewBox="0 0 120 120" className={common} fill="none">
            <circle cx="52" cy="52" r="26" className="stroke-primary" strokeWidth="4" />
            <line x1="72" y1="72" x2="92" y2="92" className="stroke-primary" strokeWidth="5" strokeLinecap="round" />
            <line x1="42" y1="52" x2="62" y2="52" className="stroke-accent" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "notifications":
      return (
        <div className={className}>
          <svg viewBox="0 0 120 120" className={common} fill="none">
            <path d="M35 70 Q35 40 60 40 Q85 40 85 70 L92 82 L28 82 Z" className="fill-primary/15 stroke-primary" strokeWidth="2.5" />
            <circle cx="60" cy="30" r="4" className="fill-accent" />
            <path d="M52 88 Q60 95 68 88" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      );
  }
};

export default EmptyIllustration;

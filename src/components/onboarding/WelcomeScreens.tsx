import { useState } from "react";
import { ShieldCheck, Wallet, MapPin, ChevronRight } from "lucide-react";

interface WelcomeScreensProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: ShieldCheck,
    iconBg: "gradient-trust",
    title: "Verified Landlords,\nZero Scams",
    description: "Every landlord is ID-verified. Every listing is real. Browse with confidence across all 47 counties.",
    accent: "Keja Safi, Keja Sure.",
  },
  {
    icon: Wallet,
    iconBg: "gradient-mpesa",
    title: "Unlock Contacts\nvia M-Pesa",
    description: "Securely unlock landlord contacts and chat access through M-Pesa micro-payments. No deposits, no rent collection.",
    accent: "Simple, safe unlocks.",
  },
  {
    icon: MapPin,
    iconBg: "gradient-premium",
    title: "Find Your Next\nKeja Anywhere",
    description: "From Nairobi to Mombasa, Kisumu to Nakuru. Discover rentals, short stays, and home services nationwide.",
    accent: "47 counties. One app.",
  },
];

const WelcomeScreens = ({ onComplete }: WelcomeScreensProps) => {
  const [current, setCurrent] = useState(0);

  const isLast = current === slides.length - 1;
  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-[90] bg-background flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end px-5 pt-5">
        <button
          onClick={onComplete}
          className="text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-full bg-secondary"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Icon */}
        <div className={`w-24 h-24 rounded-3xl ${slide.iconBg} flex items-center justify-center mb-8 animate-fade-in`}>
          <Icon className="w-12 h-12 text-primary-foreground" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-foreground leading-tight whitespace-pre-line mb-3 animate-fade-in">
          {slide.title}
        </h1>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mb-4 animate-fade-in">
          {slide.description}
        </p>

        {/* Accent text */}
        <p className="text-sm font-semibold text-primary animate-fade-in">
          {slide.accent}
        </p>
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-10">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => (isLast ? onComplete() : setCurrent(current + 1))}
          className="w-full py-4 rounded-2xl gradient-trust text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          {isLast ? "Find Your Next Keja" : "Continue"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreens;

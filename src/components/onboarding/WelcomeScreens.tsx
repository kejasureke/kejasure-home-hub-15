import { useState, useRef, useEffect } from "react";
import { ChevronRight, ShieldCheck, ChevronLeft } from "lucide-react";
import logoIcon from "@/assets/logo-icon-green.png";

interface WelcomeScreensProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Verified Landlords,\nZero Scams",
    description: "Every landlord is ID-verified. Every listing is real. Browse with confidence across all 47 counties.",
    accent: "Keja Safi, Keja Sure.",
  },
  {
    title: "Direct Contact,\nNo Middlemen",
    description: "Call or chat with landlords directly. No hidden fees, no brokers. Just you and your next home.",
    accent: "Simple, direct connections.",
  },
  {
    title: "Find Your Next\nKeja Anywhere",
    description: "From Nairobi to Mombasa, Kisumu to Nakuru. Discover rentals, short stays, and home services nationwide.",
    accent: "47 counties. One app.",
  },
];

const SWIPE_THRESHOLD = 50; // px

const WelcomeScreens = ({ onComplete }: WelcomeScreensProps) => {
  const [current, setCurrent] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const [hintTimedOut, setHintTimedOut] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeHandled = useRef(false);

  const isLast = current === slides.length - 1;
  const slide = slides[current];

  // Auto-hide hint after a few seconds even if user doesn't swipe
  useEffect(() => {
    const t = setTimeout(() => setHintTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, []);

  const markSwiped = () => {
    if (!swiped) setSwiped(true);
  };

  const goNext = () => {
    setCurrent((c) => Math.min(c + 1, slides.length - 1));
  };
  const goPrev = () => {
    setCurrent((c) => Math.max(c - 1, 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipeHandled.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || swipeHandled.current) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
      markSwiped();
      swipeHandled.current = true;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const showHint = !swiped && !hintTimedOut && !isLast;

  return (
    <div
      className="fixed inset-0 z-[90] bg-background flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar: trust micro-badge + skip */}
      <div className="flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/15">
          <ShieldCheck className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary tracking-wide">
            Safe & Verified
          </span>
        </div>
        <button
          onClick={onComplete}
          className="text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-full bg-secondary"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div
        key={current}
        className="flex-1 flex flex-col items-center justify-center px-8 text-center select-none"
      >
        {/* Logo icon */}
        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 animate-fade-in">
          <img
            src={logoIcon}
            alt="KejaSure"
            className="w-16 h-16 object-contain"
            draggable={false}
          />
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
        {/* Swipe hint */}
        <div
          aria-hidden="true"
          className={`flex items-center justify-center gap-1.5 mb-3 h-4 transition-opacity duration-500 ${
            showHint ? "opacity-100" : "opacity-0"
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span
            className="text-[11px] font-medium text-muted-foreground animate-swipe-hint"
            style={{ willChange: "transform, opacity" }}
          >
            Swipe to see how we keep you safe
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                markInteracted();
                setCurrent(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => {
            markInteracted();
            isLast ? onComplete() : setCurrent(current + 1);
          }}
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

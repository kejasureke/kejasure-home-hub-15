import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft, ShieldCheck } from "lucide-react";
import logoIcon from "@/assets/logo-icon-green.png";

interface WelcomeScreensProps {
  onComplete: () => void;
  onSkip?: () => void;
  onLogin?: () => void;
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
    title: "Short Stays\nMade Easy",
    description: "Book nightly stays in Diani, Naivasha, Nanyuki and beyond. Perfect for weekends, holidays and work trips.",
    accent: "Your home away from home.",
  },
  {
    title: "Corporate Stays &\nBusiness Spaces",
    description: "Furnished homes for NGOs, consultants and expats. Plus shops, offices, godowns and showrooms for your business.",
    accent: "Live and work, sorted.",
  },
  {
    title: "Home Services\nAt Your Fingertips",
    description: "Book trusted movers, cleaners, plumbers, electricians and more. Rated professionals near you.",
    accent: "One app for everything home.",
  },
  {
    title: "Find Your Next\nKeja Anywhere",
    description: "From Nairobi to Mombasa, Kisumu to Nakuru. Discover rentals, short stays, and home services nationwide.",
    accent: "47 counties. One app.",
  },
];

const SWIPE_THRESHOLD = 50;

const WelcomeScreens = ({ onComplete, onSkip, onLogin }: WelcomeScreensProps) => {
  const [current, setCurrent] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const [hintTimedOut, setHintTimedOut] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeHandled = useRef(false);

  const isLast = current === slides.length - 1;
  const isFirst = current === 0;
  const slide = slides[current];

  useEffect(() => {
    const t = setTimeout(() => setHintTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, []);

  const goNext = () => {
    if (isLast) onComplete();
    else setCurrent((c) => c + 1);
    setSwiped(true);
  };
  const goPrev = () => {
    setCurrent((c) => Math.max(c - 1, 0));
    setSwiped(true);
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
      {/* Top bar: trust micro-badge + Skip */}
      <div className="relative flex items-center justify-center px-5 pt-safe">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/15">
          <ShieldCheck className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary tracking-wide">
            Safe & Verified
          </span>
        </div>
        {onSkip && !isLast && (
          <button
            onClick={onSkip}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground active:text-foreground px-2 py-1"
          >
            Skip
          </button>
        )}
      </div>

      {/* Content */}
      <div
        key={current}
        className="flex-1 flex flex-col items-center justify-center px-8 text-center select-none"
      >
        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 animate-fade-in">
          <img src={logoIcon} alt="KejaSure" className="w-16 h-16 object-contain" draggable={false} />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground leading-tight whitespace-pre-line mb-3 animate-fade-in">
          {slide.title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mb-4 animate-fade-in">
          {slide.description}
        </p>
        <p className="text-sm font-semibold text-primary animate-fade-in">{slide.accent}</p>
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-8">
        {/* Swipe hint */}
        <div
          aria-hidden="true"
          className={`flex items-center justify-center gap-1.5 mb-3 h-4 transition-opacity duration-500 ${
            showHint ? "opacity-100" : "opacity-0"
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[11px] font-medium text-muted-foreground">
            Swipe or tap to navigate
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-5">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                setCurrent(i);
                setSwiped(true);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Nav buttons */}
        {isLast ? (
          <button
            onClick={onComplete}
            className="w-full py-4 rounded-2xl gradient-trust text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform animate-fade-in"
          >
            Find Your Next Keja
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={isFirst}
              className={`h-12 px-4 rounded-2xl border border-border bg-card font-semibold text-sm flex items-center justify-center gap-1.5 transition-all ${
                isFirst ? "opacity-40" : "active:scale-[0.98] text-foreground"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={goNext}
              className="flex-1 h-12 rounded-2xl gradient-trust text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Already have an account */}
        {onLogin && (
          <button
            onClick={onLogin}
            className="w-full mt-4 text-center text-sm text-muted-foreground active:text-foreground"
          >
            Already have an account?{" "}
            <span className="font-semibold text-primary">Log in</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreens;

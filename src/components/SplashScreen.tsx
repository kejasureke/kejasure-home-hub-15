import { useState, useEffect } from "react";
import logoIconWhite from "@/assets/logo-icon-white.png";
import logoIconGreen from "@/assets/logo-icon-green.png";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0);
  const isDark = document.documentElement.classList.contains("dark");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3400),
      setTimeout(() => setPhase(5), 4200),
      setTimeout(() => setPhase(6), 5800),
      setTimeout(() => onComplete(), 6500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const bg = isDark
    ? "linear-gradient(180deg, hsl(150 20% 9%) 0%, hsl(150 20% 4%) 100%)"
    : "linear-gradient(180deg, hsl(152 58% 22%) 0%, hsl(152 58% 12%) 100%)";

  const textClass = isDark ? "text-primary" : "text-white";
  const subtitleColor = isDark ? "text-primary/50" : "text-white/50";
  const dotBg = isDark ? "bg-primary/40" : "bg-white/40";

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase >= 6 ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: bg }}
    >
      {/* Radial glow behind logo */}
      <div
        className="absolute rounded-full transition-all duration-1000"
        style={{
          width: 280,
          height: 280,
          background: isDark
            ? "radial-gradient(circle, hsl(148 52% 36% / 0.15) 0%, transparent 70%)"
            : "radial-gradient(circle, hsl(0 0% 100% / 0.08) 0%, transparent 70%)",
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "scale(1)" : "scale(0.5)",
        }}
      />

      {/* Animated logo assembly */}
      <div className="relative flex flex-col items-center">
        {/* Logo icon with clip-path reveal animation */}
        <div className="relative w-32 h-32 mb-6">
          {/* Phase 1-3: Progressive reveal */}
          <div
            className="absolute inset-0"
            style={{
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? "translateY(0) scale(1)" : "translateY(-20px) scale(0.8)",
              clipPath: phase >= 3
                ? "inset(0 0 0 0)"
                : phase >= 2
                ? "inset(0 0 35% 0)"
                : phase >= 1
                ? "inset(0 15% 50% 15%)"
                : "inset(50% 50% 50% 50%)",
              transition: "opacity 0.9s ease-out, transform 0.9s ease-out, clip-path 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <img
              src={isDark ? logoIconGreen : logoIconWhite}
              alt="KejaSure"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>

          {/* Phase 2: Circular sweep overlay */}
          <svg
            viewBox="0 0 128 128"
            className="absolute inset-0 w-full h-full"
            style={{ opacity: phase >= 2 && phase < 3 ? 0.6 : 0, transition: "opacity 0.5s" }}
          >
            <circle
              cx="64" cy="64" r="56"
              fill="none"
              stroke={isDark ? "hsl(148, 52%, 48%)" : "white"}
              strokeWidth="2"
              strokeDasharray={352}
              strokeDashoffset={phase >= 2 ? 0 : 352}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>

          {/* Phase 3: Shimmer effect */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
              opacity: phase === 3 ? 1 : 0,
              transform: phase === 3 ? "translateX(40px)" : "translateX(-40px)",
              transition: "opacity 0.3s, transform 1s ease-out",
            }}
          />
        </div>

        {/* Brand name — phase 4 */}
        <h1
          className={`text-4xl font-extrabold tracking-tight ${textClass}`}
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          }}
        >
          KejaSure
        </h1>

        {/* Slogan — phase 5 */}
        <p
          className="mt-2 text-lg font-medium"
          style={{
            color: "hsl(37 91% 55%)",
            opacity: phase >= 5 ? 1 : 0,
            transform: phase >= 5 ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          }}
        >
          Pata Keja, Be Sure.
        </p>
        <p
          className={`mt-1 text-xs font-medium tracking-widest uppercase ${subtitleColor}`}
          style={{
            opacity: phase >= 5 ? 1 : 0,
            transform: phase >= 5 ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          }}
        >
          Kenya's Trusted Rental Marketplace
        </p>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-24 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${dotBg}`}
            style={{
              animation: phase >= 4 ? `splash-pulse 1.2s ease-in-out ${i * 0.2}s infinite` : "none",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes splash-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;

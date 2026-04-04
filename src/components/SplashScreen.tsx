import { useState, useEffect } from "react";
import kejasureLogo from "@/assets/kejasure-logo.png";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),   // House icon appears
      setTimeout(() => setPhase(2), 900),   // Circle wraps
      setTimeout(() => setPhase(3), 1500),  // Hand forms
      setTimeout(() => setPhase(4), 2100),  // Brand text
      setTimeout(() => setPhase(5), 2700),  // Slogan
      setTimeout(() => setPhase(6), 4000),  // Fade out
      setTimeout(() => onComplete(), 4600), // Done
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase >= 6 ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(180deg, hsl(150 60% 26%) 0%, hsl(150 60% 14%) 100%)",
      }}
    >
      {/* Kenya-inspired skyline silhouette */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: "18%" }}>
        <svg
          viewBox="0 0 400 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full transition-all duration-1000 ${
            phase >= 2 ? "opacity-20 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          preserveAspectRatio="none"
        >
          {/* Estate/skyline silhouette */}
          <path
            d="M0 80 L0 55 L15 55 L15 40 L25 40 L25 50 L35 50 L35 30 L45 30 L45 50 L55 50 L55 45 L60 35 L65 45 L65 50 L80 50 L80 38 L90 38 L90 50 L100 50 L100 42 L105 32 L110 42 L110 50 L125 50 L125 35 L135 35 L135 50 L145 50 L145 28 L155 28 L155 50 L165 50 L165 44 L170 36 L175 44 L175 50 L195 50 L195 40 L200 30 L205 40 L205 50 L220 50 L220 38 L230 38 L230 50 L245 50 L245 25 L255 25 L255 50 L265 50 L265 45 L270 38 L275 45 L275 50 L290 50 L290 42 L300 42 L300 50 L310 50 L310 35 L320 35 L320 50 L335 50 L335 30 L345 30 L345 50 L360 50 L360 40 L370 40 L370 50 L385 50 L385 44 L395 44 L395 55 L400 55 L400 80 Z"
            fill="white"
          />
          {/* Small windows */}
          {[42, 92, 132, 152, 227, 252, 297, 317, 342].map((x, i) => (
            <rect key={i} x={x - 2} y={x === 152 ? 33 : x === 252 ? 30 : x === 342 ? 35 : 43} width="4" height="4" fill="hsl(150 60% 26%)" opacity="0.3" rx="0.5" />
          ))}
        </svg>
      </div>

      {/* Animated logo assembly */}
      <div className="relative flex flex-col items-center">
        {/* House icon with circle and hand — using SVG recreation */}
        <div className="relative w-32 h-32 mb-6">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Circle — phase 2 */}
            <circle
              cx="60"
              cy="52"
              r="38"
              stroke="white"
              strokeWidth="5"
              fill="none"
              className="transition-all duration-700"
              style={{
                strokeDasharray: 240,
                strokeDashoffset: phase >= 2 ? 0 : 240,
                opacity: phase >= 2 ? 1 : 0,
              }}
            />

            {/* House — phase 1 */}
            <g
              className="transition-all duration-500"
              style={{
                opacity: phase >= 1 ? 1 : 0,
                transform: phase >= 1 ? "translateY(0)" : "translateY(10px)",
              }}
            >
              {/* Roof */}
              <path d="M60 25 L40 42 L80 42 Z" fill="white" />
              {/* Chimney */}
              <rect x="70" y="28" width="5" height="10" fill="white" />
              {/* Body */}
              <rect x="44" y="42" width="32" height="24" fill="white" />
              {/* Door */}
              <rect x="55" y="50" width="10" height="16" fill="hsl(150, 60%, 20%)" rx="1" />
              {/* Windows */}
              <rect x="48" y="47" width="6" height="6" fill="hsl(150, 60%, 20%)" rx="0.5" />
              <rect x="66" y="47" width="6" height="6" fill="hsl(150, 60%, 20%)" rx="0.5" />
            </g>

            {/* Hand — phase 3 */}
            <path
              d="M30 75 Q35 65, 50 68 Q55 69, 60 68 Q65 67, 70 68 Q85 65, 90 75"
              stroke="white"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              className="transition-all duration-700"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: phase >= 3 ? 0 : 100,
                opacity: phase >= 3 ? 1 : 0,
              }}
            />
            {/* Palm fill */}
            <path
              d="M30 75 Q35 65, 50 68 Q55 69, 60 68 Q65 67, 70 68 Q85 65, 90 75 Q75 78, 60 78 Q45 78, 30 75 Z"
              fill="white"
              className="transition-all duration-700"
              style={{
                opacity: phase >= 3 ? 0.9 : 0,
              }}
            />
          </svg>
        </div>

        {/* Brand name — phase 4 */}
        <h1
          className="text-4xl font-extrabold text-white tracking-tight transition-all duration-600"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? "translateY(0)" : "translateY(12px)",
          }}
        >
          KejaSure
        </h1>

        {/* Slogan — phase 5 */}
        <p
          className="mt-2 text-lg font-medium transition-all duration-600"
          style={{
            color: "hsl(37 91% 55%)",
            opacity: phase >= 5 ? 1 : 0,
            transform: phase >= 5 ? "translateY(0)" : "translateY(8px)",
          }}
        >
          Pata Keja, Be Sure.
        </p>
      </div>

      {/* Subtle loading indicator */}
      <div className="absolute bottom-24 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/40"
            style={{
              animation: phase >= 4 ? `pulse 1.2s ease-in-out ${i * 0.2}s infinite` : "none",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;

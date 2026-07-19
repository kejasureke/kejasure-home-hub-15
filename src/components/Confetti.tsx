import { useEffect, useState } from "react";

interface ConfettiProps {
  active: boolean;
  duration?: number;
  onDone?: () => void;
}

const COLORS = ["#1A6B3C", "#F5A623", "#F87171", "#60A5FA", "#A78BFA"];

const Confetti = ({ active, duration = 1600, onDone }: ConfettiProps) => {
  const [pieces, setPieces] = useState<Array<{ id: number; left: number; delay: number; color: string; rotate: number }>>([]);

  useEffect(() => {
    if (!active) return;
    const next = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 200,
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
    }));
    setPieces(next);
    const t = setTimeout(() => {
      setPieces([]);
      onDone?.();
    }, duration);
    return () => clearTimeout(t);
  }, [active, duration, onDone]);

  if (!pieces.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 w-2 h-3 rounded-sm"
          style={{
            left: `${p.left}%`,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${duration}ms ease-in ${p.delay}ms forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};

export default Confetti;

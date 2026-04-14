import { useState, useRef } from "react";
import { Trash2 } from "lucide-react";
import PropertyCard from "./PropertyCard";
import type { Property } from "@/data/mockData";

interface SwipeablePropertyCardProps {
  property: Property;
  onPress: () => void;
  onRemove: (id: string) => void;
  onToggleLike: (id: string) => void;
}

const SwipeablePropertyCard = ({ property, onPress, onRemove, onToggleLike }: SwipeablePropertyCardProps) => {
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef(false);
  const THRESHOLD = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    locked.current = false;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Lock direction on first significant movement
    if (!locked.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      locked.current = true;
      if (Math.abs(dy) > Math.abs(dx)) {
        setSwiping(false);
        return;
      }
    }

    if (!swiping) return;
    // Only allow left swipe
    setOffsetX(Math.min(0, dx));
  };

  const handleTouchEnd = () => {
    if (offsetX < -THRESHOLD) {
      setOffsetX(-THRESHOLD);
    } else {
      setOffsetX(0);
    }
    setSwiping(false);
  };

  const isRevealed = offsetX <= -THRESHOLD;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background action */}
      <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-destructive rounded-r-2xl z-0">
        <button
          onClick={() => onRemove(property.id)}
          className="flex flex-col items-center gap-1"
        >
          <Trash2 className="w-5 h-5 text-destructive-foreground" />
          <span className="text-[10px] font-semibold text-destructive-foreground">Remove</span>
        </button>
      </div>

      {/* Foreground card */}
      <div
        className="relative z-10 bg-background transition-transform"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <PropertyCard
          property={property}
          onPress={isRevealed ? () => setOffsetX(0) : onPress}
          liked={true}
          onToggleLike={onToggleLike}
        />
      </div>
    </div>
  );
};

export default SwipeablePropertyCard;

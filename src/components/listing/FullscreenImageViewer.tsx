import { X, ZoomIn } from "lucide-react";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import SwipeableImageGallery from "@/components/SwipeableImageGallery";
import { useState, useRef, useEffect } from "react";
import { haptic } from "@/lib/despia";

interface FullscreenImageViewerProps {
  images: string[];
  alt: string;
  initialIndex?: number;
  onClose: () => void;
}

const FullscreenImageViewer = ({ images, alt, initialIndex = 0, onClose }: FullscreenImageViewerProps) => {
  const { closing, triggerClose } = useOverlayClose(onClose);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const lastTap = useRef(0);
  const pinchStart = useRef<number | null>(null);
  const pinchBaseScale = useRef(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom when swiping to a new image
  useEffect(() => {
    setZoomed(false);
    setScale(1);
  }, [index]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      // Double-tap
      const rect = containerRef.current?.getBoundingClientRect();
      const clientX = "touches" in e ? (e.changedTouches?.[0]?.clientX ?? 0) : e.clientX;
      const clientY = "touches" in e ? (e.changedTouches?.[0]?.clientY ?? 0) : e.clientY;
      if (rect) {
        setOrigin({
          x: ((clientX - rect.left) / rect.width) * 100,
          y: ((clientY - rect.top) / rect.height) * 100,
        });
      }
      haptic("light");
      if (zoomed) {
        setZoomed(false);
        setScale(1);
      } else {
        setZoomed(true);
        setScale(2.5);
      }
    }
    lastTap.current = now;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStart.current = Math.hypot(dx, dy);
      pinchBaseScale.current = scale;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStart.current != null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const next = Math.max(1, Math.min(4, pinchBaseScale.current * (dist / pinchStart.current)));
      setScale(next);
      setZoomed(next > 1.05);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (pinchStart.current != null) {
      pinchStart.current = null;
      if (scale < 1.15) {
        setScale(1);
        setZoomed(false);
      }
    }
    handleTap(e);
  };

  return (
    <div className={`fixed inset-0 z-[80] bg-black ${closing ? "animate-slide-down" : "animate-slide-up"}`}>
      <button
        onClick={triggerClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
        aria-label="Close fullscreen"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md flex items-center gap-1.5">
        <span className="text-xs font-semibold text-white">
          {index + 1} / {images.length}
        </span>
        {zoomed && <ZoomIn className="w-3 h-3 text-white/70" />}
      </div>

      {!zoomed && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md">
          <span className="text-[10px] text-white/80">Double-tap to zoom · Pinch to scale</span>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleTap}
      >
        <div
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: `${origin.x}% ${origin.y}%`,
          }}
        >
          <SwipeableImageGallery
            images={images}
            alt={alt}
            className="w-full h-full"
            imageClassName="object-contain"
            controlledIndex={index}
            onIndexChange={setIndex}
            showGradient={false}
            bottomOffsetClass="bottom-8"
            lazy={false}
          />
        </div>
      </div>
    </div>
  );
};

export default FullscreenImageViewer;

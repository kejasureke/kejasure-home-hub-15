import { useRef, useState, useEffect } from "react";
import { Image as ImageIcon } from "lucide-react";
import BlurImage from "./BlurImage";

interface SwipeableImageGalleryProps {
  images: string[];
  alt: string;
  /** Tailwind classes controlling height/aspect of the gallery wrapper. */
  className?: string;
  /** Image object-fit class (default object-cover). */
  imageClassName?: string;
  /** Force-control the active index from outside (optional). */
  controlledIndex?: number;
  onIndexChange?: (index: number) => void;
  onImageClick?: (index: number) => void;
  /** Show a dim gradient overlay on top of the image. */
  showGradient?: boolean;
  /** Position of the counter/indicators relative to bottom. Defaults to bottom-3. */
  bottomOffsetClass?: string;
  /** Lazy load the images. */
  lazy?: boolean;
}

/**
 * Reusable horizontal-swipe image gallery with dot indicators and an
 * "active / total" counter. Uses native scroll-snap so it feels native on
 * touch devices while remaining keyboard/click accessible via the dots.
 */
const SwipeableImageGallery = ({
  images,
  alt,
  className = "aspect-[16/10]",
  imageClassName = "object-cover",
  controlledIndex,
  onIndexChange,
  onImageClick,
  showGradient = true,
  bottomOffsetClass = "bottom-3",
  lazy = true,
}: SwipeableImageGalleryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex ?? internalIndex;
  const total = images.length;

  // Sync scroll position when controlled index changes externally.
  useEffect(() => {
    if (controlledIndex === undefined) return;
    const el = scrollRef.current;
    if (!el) return;
    const target = controlledIndex * el.clientWidth;
    if (Math.abs(el.scrollLeft - target) > 4) {
      el.scrollTo({ left: target, behavior: "smooth" });
    }
  }, [controlledIndex]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== activeIndex) {
      if (controlledIndex === undefined) setInternalIndex(idx);
      onIndexChange?.(idx);
    }
  };

  const scrollToIndex = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
    if (controlledIndex === undefined) setInternalIndex(idx);
    onIndexChange?.(idx);
  };

  if (total === 0) return null;

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {images.map((src, i) => (
          <div key={i} className="w-full h-full shrink-0 snap-center">
            <BlurImage
              src={src}
              alt={`${alt} ${i + 1}`}
              wrapperClassName="w-full h-full"
              onClick={(e) => {
                if (onImageClick) {
                  e.stopPropagation();
                  onImageClick(i);
                }
              }}
              className={`w-full h-full ${imageClassName} ${onImageClick ? "cursor-pointer" : ""}`}
            />
          </div>
        ))}
      </div>

      {showGradient && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
      )}

      {/* Edge swipe affordances */}
      {total > 1 && (
        <>
          {activeIndex > 0 && (
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/25 to-transparent" />
          )}
          {activeIndex < total - 1 && (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/25 to-transparent" />
          )}
        </>
      )}

      {/* Counter — key on index to fade-in on change */}
      <div className={`absolute ${bottomOffsetClass} right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm pointer-events-none overflow-hidden`}>
        <span
          key={activeIndex}
          className="text-[10px] font-semibold text-white flex items-center gap-1 animate-fade-in"
        >
          <ImageIcon className="w-3 h-3" />
          {total > 1 ? `${activeIndex + 1} / ${total}` : total}
        </span>
      </div>

      {/* Dot indicators */}
      {total > 1 && (
        <div className={`absolute ${bottomOffsetClass} left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm`}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                scrollToIndex(i);
              }}
              aria-label={`Go to image ${i + 1}`}
              className={`rounded-full transition-all ${
                i === activeIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SwipeableImageGallery;

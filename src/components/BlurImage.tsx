import { useState, ImgHTMLAttributes } from "react";
import logoIconWhite from "@/assets/logo-icon-white.png";

interface BlurImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  wrapperClassName?: string;
  /** Overlay the KejaSure watermark + block saving. Default true. */
  watermark?: boolean;
}

/**
 * Progressive blur-up image with a KejaSure watermark overlay.
 * Long-press save, right-click save and drag-out are disabled so photos
 * can't easily be lifted and re-listed elsewhere.
 */
const BlurImage = ({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  watermark = true,
  ...rest
}: BlurImageProps) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden select-none ${wrapperClassName}`}>
      <div
        aria-hidden
        className={`absolute inset-0 bg-secondary/60 transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100 animate-pulse"
        }`}
      />
      <img
        {...rest}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        onLoad={() => setLoaded(true)}
        style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", ...(rest.style || {}) }}
        className={`${className} transition-[filter,opacity] duration-500 ${
          loaded ? "blur-0 opacity-100" : "blur-md opacity-0"
        }`}
      />

      {watermark && loaded && (
        <>
          {/* Tiled diagonal wordmark */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex flex-col justify-around opacity-[0.13] overflow-hidden"
          >
            {[0, 1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex justify-around -rotate-[24deg] whitespace-nowrap"
              >
                {[0, 1, 2].map((col) => (
                  <span
                    key={col}
                    className="text-[10px] font-extrabold tracking-[0.2em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                  >
                    KEJASURE
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Corner logo badge */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/35 backdrop-blur-[2px]"
          >
            <img src={logoIconWhite} alt="" className="w-3 h-3 opacity-90" draggable={false} />
            <span className="text-[8px] font-bold tracking-wide text-white/90">KejaSure</span>
          </div>
        </>
      )}

      {/* Transparent shield: stops long-press "save image" reaching the <img> */}
      {watermark && (
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ WebkitTouchCallout: "none" }} />
      )}
    </div>
  );
};

export default BlurImage;

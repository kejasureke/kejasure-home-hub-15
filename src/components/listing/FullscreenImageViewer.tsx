import { X } from "lucide-react";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import SwipeableImageGallery from "@/components/SwipeableImageGallery";
import { useState } from "react";

interface FullscreenImageViewerProps {
  images: string[];
  alt: string;
  initialIndex?: number;
  onClose: () => void;
}

const FullscreenImageViewer = ({ images, alt, initialIndex = 0, onClose }: FullscreenImageViewerProps) => {
  const { closing, triggerClose } = useOverlayClose(onClose);
  const [index, setIndex] = useState(initialIndex);

  return (
    <div className={`fixed inset-0 z-[80] bg-black ${closing ? "animate-slide-down" : "animate-slide-up"}`}>
      <button
        onClick={triggerClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
        aria-label="Close fullscreen"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md">
        <span className="text-xs font-semibold text-white">
          {index + 1} / {images.length}
        </span>
      </div>

      <div className="w-full h-full flex items-center justify-center">
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
  );
};

export default FullscreenImageViewer;

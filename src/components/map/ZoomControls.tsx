import { Plus, Minus, Locate } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter?: () => void;
  isCentered?: boolean;
}

const ZoomControls = ({
  zoom,
  minZoom,
  maxZoom,
  onZoomIn,
  onZoomOut,
  onRecenter,
  isCentered,
}: ZoomControlsProps) => (
  <>
    <div className="absolute bottom-3 right-3 z-40 flex flex-col gap-1.5">
      <button
        onClick={onZoomIn}
        disabled={zoom >= maxZoom}
        className="w-9 h-9 rounded-xl bg-card shadow-md flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
        aria-label="Zoom in"
      >
        <Plus className="w-4 h-4 text-foreground" />
      </button>
      <button
        onClick={onZoomOut}
        disabled={zoom <= minZoom}
        className="w-9 h-9 rounded-xl bg-card shadow-md flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
        aria-label="Zoom out"
      >
        <Minus className="w-4 h-4 text-foreground" />
      </button>
      {onRecenter && (
        <button
          onClick={onRecenter}
          disabled={isCentered}
          className="w-9 h-9 rounded-xl bg-card shadow-md flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 animate-fade-in"
          aria-label="Recenter map"
        >
          <Locate className="w-4 h-4 text-primary" />
        </button>
      )}
    </div>

    <div className="absolute top-3 right-3 z-40 px-2 py-1 rounded-lg bg-card/80 shadow-sm">
      <span className="text-[10px] font-medium text-muted-foreground">{zoom.toFixed(1)}x</span>
    </div>
  </>
);

export default ZoomControls;

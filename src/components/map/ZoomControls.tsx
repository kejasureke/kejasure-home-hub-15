import { Plus, Minus } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const ZoomControls = ({ zoom, minZoom, maxZoom, onZoomIn, onZoomOut }: ZoomControlsProps) => (
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
    </div>

    <div className="absolute top-3 right-3 z-40 px-2 py-1 rounded-lg bg-card/80 shadow-sm">
      <span className="text-[10px] font-medium text-muted-foreground">{zoom.toFixed(1)}x</span>
    </div>
  </>
);

export default ZoomControls;

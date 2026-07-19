import { Heart, Share2, GitCompare, EyeOff, X } from "lucide-react";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import { useHardwareBack } from "@/hooks/useHardwareBack";
import { haptic } from "@/lib/despia";

interface PropertyQuickActionsProps {
  open: boolean;
  onClose: () => void;
  title: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onCompare?: () => void;
  onHide?: () => void;
}

const PropertyQuickActions = ({
  open,
  onClose,
  title,
  isFavorite,
  onToggleFavorite,
  onShare,
  onCompare,
  onHide,
}: PropertyQuickActionsProps) => {
  const { closing, triggerClose } = useOverlayClose(onClose);
  useHardwareBack(open, triggerClose);

  if (!open) return null;

  const Action = ({
    icon: Icon,
    label,
    onClick,
    tone = "default",
  }: { icon: any; label: string; onClick: () => void; tone?: "default" | "destructive" }) => (
    <button
      onClick={() => {
        haptic("light");
        onClick();
        triggerClose();
      }}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl active:bg-secondary transition-colors ${
        tone === "destructive" ? "text-destructive" : "text-foreground"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-end bg-foreground/40 backdrop-blur-sm ${
        closing ? "animate-fade-out" : "animate-fade-in"
      }`}
      onClick={triggerClose}
    >
      <div
        className={`w-full max-w-lg mx-auto bg-background rounded-t-3xl safe-bottom pb-2 ${
          closing ? "animate-slide-out-right" : "animate-slide-in-right"
        }`}
        style={{ animation: closing ? "slide-down 0.25s ease-in" : "slide-up 0.28s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="px-4 pt-2 pb-1 flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground truncate">{title}</p>
          <button onClick={triggerClose} className="p-1 -mr-1 text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-2">
          <Action
            icon={Heart}
            label={isFavorite ? "Remove from saved" : "Save to favorites"}
            onClick={onToggleFavorite}
          />
          <Action icon={Share2} label="Share listing" onClick={onShare} />
          {onCompare && <Action icon={GitCompare} label="Add to compare" onClick={onCompare} />}
          {onHide && <Action icon={EyeOff} label="Hide this listing" onClick={onHide} tone="destructive" />}
        </div>
        <style>{`
          @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
          @keyframes slide-down { from { transform: translateY(0); } to { transform: translateY(100%); } }
        `}</style>
      </div>
    </div>
  );
};

export default PropertyQuickActions;

import { Bell, BellOff } from "lucide-react";
import { usePriceAlerts } from "@/hooks/usePriceAlerts";
import { toast } from "sonner";

interface PriceAlertButtonProps {
  propertyId: string;
  currentPrice: number;
}

const PriceAlertButton = ({ propertyId, currentPrice }: PriceAlertButtonProps) => {
  const { isTracking, trackPrice, untrackPrice } = usePriceAlerts();
  const tracking = isTracking(propertyId);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tracking) {
      untrackPrice(propertyId);
      toast("Price alert removed");
    } else {
      trackPrice(propertyId, currentPrice);
      toast.success("🔔 You'll be notified if the price drops!");
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${
        tracking
          ? "bg-primary/10 text-primary border border-primary/20"
          : "bg-secondary text-secondary-foreground"
      }`}
    >
      {tracking ? (
        <>
          <BellOff className="w-3.5 h-3.5" />
          Tracking Price
        </>
      ) : (
        <>
          <Bell className="w-3.5 h-3.5" />
          Alert on Drop
        </>
      )}
    </button>
  );
};

export default PriceAlertButton;

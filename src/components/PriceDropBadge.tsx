import { TrendingDown } from "lucide-react";

interface PriceDropBadgeProps {
  oldPrice: number;
  newPrice: number;
  compact?: boolean;
}

const PriceDropBadge = ({ oldPrice, newPrice, compact = false }: PriceDropBadgeProps) => {
  if (newPrice >= oldPrice) return null;
  const dropPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

  if (compact) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-trust/15 text-[9px] font-bold text-trust">
        <TrendingDown className="w-2.5 h-2.5" />
        -{dropPercent}%
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-trust/10 border border-trust/20">
      <TrendingDown className="w-4 h-4 text-trust" />
      <div>
        <p className="text-xs font-bold text-trust">Price dropped {dropPercent}%!</p>
        <p className="text-[10px] text-muted-foreground">
          <span className="line-through">KES {oldPrice.toLocaleString("en-KE")}</span>
          {" → "}
          <span className="font-bold text-trust">KES {newPrice.toLocaleString("en-KE")}</span>
        </p>
      </div>
    </div>
  );
};

export default PriceDropBadge;

import { ShieldCheck, MapPin } from "lucide-react";
import type { Property } from "@/data/mockData";
import { properties } from "@/data/mockData";

interface SimilarListingsRailProps {
  current: Property;
  onSelect: (p: Property) => void;
}

const SimilarListingsRail = ({ current, onSelect }: SimilarListingsRailProps) => {
  // Score by: same type (must), same county, same estate, similar bedrooms, similar price band
  const candidates = properties
    .filter((p) => p.id !== current.id && p.type === current.type)
    .map((p) => {
      let score = 0;
      if (p.county === current.county) score += 2;
      if (p.estate === current.estate) score += 3;
      if (p.bedrooms === current.bedrooms) score += 2;
      const priceDiff = Math.abs(p.price - current.price) / Math.max(current.price, 1);
      if (priceDiff < 0.25) score += 2;
      else if (priceDiff < 0.5) score += 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((x) => x.p);

  if (candidates.length === 0) return null;

  const fmt = (n: number) => new Intl.NumberFormat("en-KE").format(n);

  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold mb-3">More like this</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {candidates.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="shrink-0 w-44 text-left rounded-2xl bg-card border border-border overflow-hidden card-shadow active:scale-[0.97] transition-transform"
          >
            <div className="relative aspect-[4/3] bg-muted">
              <img
                src={p.images[0]}
                alt={p.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-foreground">
                  KES {fmt(p.price)}
                </span>
              </div>
              {p.verified && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-trust flex items-center justify-center">
                  <ShieldCheck className="w-3 h-3 text-trust-foreground" />
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-semibold line-clamp-1">{p.title}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                <p className="text-[10px] text-muted-foreground truncate">
                  {p.estate}, {p.county}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SimilarListingsRail;

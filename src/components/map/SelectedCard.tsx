import { Star, Bed, ShieldCheck, ChevronRight } from "lucide-react";
import type { Property, ServiceProvider } from "@/data/mockData";
import SwipeableImageGallery from "../SwipeableImageGallery";

interface SelectedCardProps {
  selected: Property | ServiceProvider;
  onSelectProperty: (id: string) => void;
}

const SelectedCard = ({ selected, onSelectProperty }: SelectedCardProps) => {
  const isProperty = "bedrooms" in selected;

  if (isProperty) {
    const p = selected as Property;
    return (
      <div className="rounded-2xl bg-card card-shadow overflow-hidden">
        <div className="relative">
          <SwipeableImageGallery
            images={p.images?.length ? p.images : [p.image]}
            alt={p.title}
            className="aspect-[16/9]"
            bottomOffsetClass="bottom-2"
          />
        </div>
        <button
          onClick={() => onSelectProperty(p.id)}
          className="w-full flex items-center gap-3 p-3 active:scale-[0.98] transition-transform text-left"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{p.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs font-bold text-primary">
                KES {new Intl.NumberFormat("en-KE").format(p.price)}
                <span className="font-normal text-muted-foreground">{p.priceUnit}</span>
              </p>
              {p.verified && <ShieldCheck className="w-3 h-3 text-primary" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Bed className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{p.bedrooms} BR</span>
              {p.rating && (
                <>
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-[10px] text-muted-foreground">{p.rating}</span>
                </>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </div>
    );
  }

  const s = selected as ServiceProvider;
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-card card-shadow">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl">
        {s.avatar}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold">{s.name}</p>
        <p className="text-xs text-muted-foreground">{s.category}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Star className="w-3 h-3 text-accent fill-accent" />
          <span className="text-[10px] font-medium">{s.rating}</span>
          <span className="text-[10px] text-muted-foreground">({s.reviews})</span>
        </div>
      </div>
    </div>
  );
};

export default SelectedCard;

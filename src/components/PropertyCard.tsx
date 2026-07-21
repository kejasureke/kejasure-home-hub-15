import { Heart, Bed, Bath, MapPin, ShieldCheck, Star, GitCompare, AlertTriangle, Ruler, Store, Building2, Factory, Hotel, UtensilsCrossed, Scissors, Pill, Dumbbell, GraduationCap, Church, Fuel, Music, ShoppingCart, Wrench, Palette, Laptop } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/mockData";
import { getScamRiskScore } from "@/utils/scamDetection";
import ScamWarningBadge from "./ScamWarningBadge";
import PriceDropBadge from "./PriceDropBadge";
import SmileIDBadge from "./SmileIDBadge";
import SwipeableImageGallery from "./SwipeableImageGallery";
import PropertyQuickActions from "./PropertyQuickActions";
import { useLongPress } from "@/hooks/useLongPress";
import { toast } from "sonner";
interface PropertyCardProps {
  property: Property;
  onPress: (id: string) => void;
  liked?: boolean;
  onToggleLike?: (id: string) => void;
  compareMode?: boolean;
  isComparing?: boolean;
  onToggleCompare?: (id: string) => void;
}

const PropertyCard = ({ property, onPress, liked = false, onToggleLike, compareMode, isComparing, onToggleCompare }: PropertyCardProps) => {
  const scamRisk = getScamRiskScore(property);
  const oldPrice = property.priceHistory?.[0]?.price;
  const [quickOpen, setQuickOpen] = useState(false);
  const { handlers, didFire } = useLongPress(() => setQuickOpen(true));

  const formatPrice = (price: number) => {
    return price >= 1000 ? `KES ${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K` : `KES ${price}`;
  };

  return (
    <>
    <PropertyQuickActions
      open={quickOpen}
      onClose={() => setQuickOpen(false)}
      title={property.title}
      isFavorite={liked}
      onToggleFavorite={() => onToggleLike?.(property.id)}
      onShare={() => {
        const text = `Check out ${property.title} on KejaSure — ${property.estate}, ${property.county}.`;
        if (navigator.share) navigator.share({ title: property.title, text }).catch(() => {});
        else { navigator.clipboard?.writeText(text); toast.success("Copied share message"); }
      }}
      onCompare={onToggleCompare ? () => onToggleCompare(property.id) : undefined}
      onHide={() => toast("Listing hidden", { description: "We'll show fewer like this." })}
    />
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => { if (didFire()) { e.preventDefault(); return; } onPress(property.id); }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPress(property.id); } }}
      {...handlers}
      className={`w-full text-left bg-card rounded-2xl card-shadow overflow-hidden transition-all duration-300 hover:card-shadow-hover active:scale-[0.98] animate-fade-in cursor-pointer ${
        isComparing ? "ring-2 ring-primary" : ""
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <SwipeableImageGallery
          images={property.images?.length ? property.images : [property.image]}
          alt={property.title}
          className="w-full h-full"
          bottomOffsetClass="bottom-12"
        />

        {/* Ribbons */}
        {property.featured && <div className="premium-ribbon">⭐ Featured</div>}
        {property.available && !property.featured && (
          <div className="absolute top-3 left-0 px-3 py-1 text-xs font-semibold rounded-r-full bg-trust text-trust-foreground">
            Available Now
          </div>
        )}

        {/* Top right actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          {compareMode && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCompare?.(property.id); }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isComparing ? "bg-primary text-primary-foreground" : "bg-card/80 backdrop-blur-sm"
              }`}
            >
              <GitCompare className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleLike?.(property.id); }}
            className="w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90"
          >
            <Heart className={`w-4.5 h-4.5 transition-colors ${liked ? "fill-destructive text-destructive" : "text-foreground/70"}`} strokeWidth={2} />
          </button>
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <div className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg">
            <span className="text-lg font-bold text-gray-900">{formatPrice(property.price)}</span>
            <span className="text-sm text-gray-600">{property.priceUnit}</span>
          </div>
          {oldPrice && oldPrice > property.price && (
            <PriceDropBadge oldPrice={oldPrice} newPrice={property.price} compact />
          )}
        </div>

        {/* Rating */}
        {property.rating && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-card/80 backdrop-blur-sm">
            <Star className="w-3 h-3 fill-gold text-gold" />
            <span className="text-xs font-semibold">{property.rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Title + Badge row */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 flex-1">{property.title}</h3>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {property.verified ? (
              <div className="verified-badge">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-[10px] font-medium text-destructive">
                <AlertTriangle className="w-3 h-3" />
                <span>Unverified</span>
              </div>
            )}
            <ScamWarningBadge risk={scamRisk} compact />
          </div>
        </div>

        {/* Corporate badge */}
        {property.corporate && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-[11px] font-semibold text-primary w-fit">
            💼 Corporate Stay
          </div>
        )}

        {/* Commercial type + sqft badges */}
        {property.type === "commercial" && (
          <div className="flex items-center gap-2 flex-wrap">
            {property.commercialType && (() => {
              const typeConfig: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
                shop: { icon: <Store className="w-3.5 h-3.5" />, bg: "bg-blue-500/15", text: "text-blue-600" },
                office: { icon: <Building2 className="w-3.5 h-3.5" />, bg: "bg-slate-500/15", text: "text-slate-600" },
                godown: { icon: <Factory className="w-3.5 h-3.5" />, bg: "bg-amber-500/15", text: "text-amber-700" },
                showroom: { icon: <Building2 className="w-3.5 h-3.5" />, bg: "bg-purple-500/15", text: "text-purple-600" },
                clinic: { icon: <Pill className="w-3.5 h-3.5" />, bg: "bg-red-500/15", text: "text-red-600" },
                hotel: { icon: <Hotel className="w-3.5 h-3.5" />, bg: "bg-indigo-500/15", text: "text-indigo-600" },
                restaurant: { icon: <UtensilsCrossed className="w-3.5 h-3.5" />, bg: "bg-orange-500/15", text: "text-orange-600" },
                salon: { icon: <Scissors className="w-3.5 h-3.5" />, bg: "bg-pink-500/15", text: "text-pink-600" },
                pharmacy: { icon: <Pill className="w-3.5 h-3.5" />, bg: "bg-emerald-500/15", text: "text-emerald-600" },
                gym: { icon: <Dumbbell className="w-3.5 h-3.5" />, bg: "bg-cyan-500/15", text: "text-cyan-600" },
                school: { icon: <GraduationCap className="w-3.5 h-3.5" />, bg: "bg-yellow-500/15", text: "text-yellow-700" },
                church: { icon: <Church className="w-3.5 h-3.5" />, bg: "bg-violet-500/15", text: "text-violet-600" },
                petrol_station: { icon: <Fuel className="w-3.5 h-3.5" />, bg: "bg-lime-500/15", text: "text-lime-700" },
                bar: { icon: <Music className="w-3.5 h-3.5" />, bg: "bg-rose-500/15", text: "text-rose-600" },
                club: { icon: <Music className="w-3.5 h-3.5" />, bg: "bg-fuchsia-500/15", text: "text-fuchsia-600" },
                supermarket: { icon: <ShoppingCart className="w-3.5 h-3.5" />, bg: "bg-teal-500/15", text: "text-teal-600" },
                hardware: { icon: <Wrench className="w-3.5 h-3.5" />, bg: "bg-stone-500/15", text: "text-stone-600" },
                garage: { icon: <Wrench className="w-3.5 h-3.5" />, bg: "bg-zinc-500/15", text: "text-zinc-600" },
                studio: { icon: <Palette className="w-3.5 h-3.5" />, bg: "bg-sky-500/15", text: "text-sky-600" },
                coworking: { icon: <Laptop className="w-3.5 h-3.5" />, bg: "bg-emerald-500/15", text: "text-emerald-600" },
              };
              const cfg = typeConfig[property.commercialType] || { icon: <Building2 className="w-3.5 h-3.5" />, bg: "bg-accent", text: "text-accent-foreground" };
              return (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text} text-[11px] font-bold w-fit capitalize`}>
                  {cfg.icon}
                  {property.commercialType.replace(/_/g, " ")}
                </div>
              );
            })()}
            {property.sizeSqft && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground w-fit">
                <Ruler className="w-3.5 h-3.5" />
                {property.sizeSqft}
              </div>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <div className="flex gap-1.5">
            <span className="location-chip">{property.county}</span>
            <span className="location-chip">{property.estate}</span>
          </div>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4">
          {property.type !== "commercial" && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Bed className="w-3.5 h-3.5" />
                <span>{property.bedrooms} Bed{property.bedrooms > 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Bath className="w-3.5 h-3.5" />
                <span>{property.bathrooms} Bath{property.bathrooms > 1 ? "s" : ""}</span>
              </div>
            </>
          )}
          {property.type === "commercial" && property.sizeSqft && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Ruler className="w-3.5 h-3.5" />
              <span>{property.sizeSqft.toLocaleString()} sqft</span>
            </div>
          )}
          {property.landlordResponseSpeed === "fast" && (
            <span className="text-[10px] font-medium text-trust">⚡ Fast reply</span>
          )}
        </div>

        {/* smile.id badge */}
        {property.verified && (
          <SmileIDBadge compact propertyId={property.id} imageCount={property.images?.length || 4} />
        )}

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {property.amenities.slice(0, 3).map((a) => (
            <span key={a} className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium text-secondary-foreground">{a}</span>
          ))}
          {property.amenities.length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-primary/5 text-[10px] font-medium text-primary">+{property.amenities.length - 3} more</span>
          )}
        </div>
      </div>
    </button>
    </>
  );
};

export default PropertyCard;

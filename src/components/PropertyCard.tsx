import { Heart, Bed, Bath, MapPin, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/mockData";

interface PropertyCardProps {
  property: Property;
  onPress: (id: string) => void;
}

const PropertyCard = ({ property, onPress }: PropertyCardProps) => {
  const [liked, setLiked] = useState(false);

  const formatPrice = (price: number) => {
    return price >= 1000 ? `KES ${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K` : `KES ${price}`;
  };

  return (
    <button
      onClick={() => onPress(property.id)}
      className="w-full text-left bg-card rounded-2xl card-shadow overflow-hidden transition-all duration-300 hover:card-shadow-hover active:scale-[0.98] animate-fade-in"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
          loading="lazy"
          width={800}
          height={500}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />

        {/* Ribbons */}
        {property.featured && <div className="premium-ribbon">⭐ Featured</div>}
        {property.available && !property.featured && (
          <div className="absolute top-3 left-0 px-3 py-1 text-xs font-semibold rounded-r-full bg-trust text-trust-foreground">
            Available Now
          </div>
        )}

        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center transition-transform active:scale-90"
        >
          <Heart
            className={`w-4.5 h-4.5 transition-colors ${liked ? "fill-destructive text-destructive" : "text-foreground/70"}`}
            strokeWidth={2}
          />
        </button>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="text-lg font-bold text-card">
            {formatPrice(property.price)}
          </span>
          <span className="text-sm text-card/80">{property.priceUnit}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
            {property.title}
          </h3>
          {property.verified && (
            <div className="verified-badge shrink-0">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <div className="flex gap-1.5">
            <span className="location-chip">{property.county}</span>
            <span className="location-chip">{property.estate}</span>
          </div>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 mb-2.5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bed className="w-3.5 h-3.5" />
            <span>{property.bedrooms} Bed{property.bedrooms > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bath className="w-3.5 h-3.5" />
            <span>{property.bathrooms} Bath{property.bathrooms > 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Amenities teaser */}
        <div className="flex flex-wrap gap-1">
          {property.amenities.slice(0, 3).map((a) => (
            <span key={a} className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium text-secondary-foreground">
              {a}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="px-2 py-0.5 rounded-md bg-primary/5 text-[10px] font-medium text-primary">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default PropertyCard;

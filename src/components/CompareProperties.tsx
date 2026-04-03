import { X, Bed, Bath, MapPin, ShieldCheck, Star } from "lucide-react";
import type { Property } from "@/data/mockData";

interface ComparePropertiesProps {
  properties: Property[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

const CompareProperties = ({ properties, onClose, onRemove }: ComparePropertiesProps) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-KE").format(price);

  if (properties.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background animate-slide-up overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background z-10">
        <button onClick={onClose}>
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="text-lg font-semibold">Compare ({properties.length})</h2>
        <div className="w-5" />
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="flex gap-3" style={{ minWidth: `${properties.length * 200}px` }}>
          {properties.map((p) => (
            <div key={p.id} className="w-[200px] shrink-0 bg-card rounded-2xl card-shadow overflow-hidden">
              <div className="relative aspect-[4/3]">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => onRemove(p.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-card/80 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-foreground" />
                </button>
              </div>
              <div className="p-3 space-y-2">
                <h3 className="text-xs font-semibold line-clamp-2">{p.title}</h3>
                <p className="text-sm font-bold text-primary">KES {formatPrice(p.price)}<span className="text-xs font-normal text-muted-foreground">{p.priceUnit}</span></p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mt-6 space-y-4">
          {[
            { label: "Location", render: (p: Property) => `${p.estate}, ${p.county}` },
            { label: "Bedrooms", render: (p: Property) => `${p.bedrooms}` },
            { label: "Bathrooms", render: (p: Property) => `${p.bathrooms}` },
            { label: "Size", render: (p: Property) => p.size || "–" },
            { label: "Floor", render: (p: Property) => p.floor || "–" },
            { label: "Deposit", render: (p: Property) => p.deposit ? `KES ${formatPrice(p.deposit)}` : "–" },
            { label: "Furnished", render: (p: Property) => p.furnished ? "Yes ✓" : "No" },
            { label: "Pet Friendly", render: (p: Property) => p.petFriendly ? "Yes 🐾" : "No" },
            { label: "Verified", render: (p: Property) => p.verified ? "Yes ✓" : "No" },
            { label: "Response Time", render: (p: Property) => p.landlordResponseTime },
            { label: "Rating", render: (p: Property) => p.rating ? `${p.rating} ⭐` : "–" },
            { label: "Move-in", render: (p: Property) => p.moveInDate || "–" },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">{row.label}</p>
              <div className="flex gap-3">
                {properties.map((p) => (
                  <div key={p.id} className="w-[200px] shrink-0 px-3 py-2 rounded-xl bg-secondary text-xs font-medium">
                    {row.render(p)}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Amenities comparison */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Amenities</p>
            <div className="flex gap-3">
              {properties.map((p) => (
                <div key={p.id} className="w-[200px] shrink-0">
                  <div className="flex flex-wrap gap-1">
                    {p.amenities.map((a) => (
                      <span key={a} className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareProperties;

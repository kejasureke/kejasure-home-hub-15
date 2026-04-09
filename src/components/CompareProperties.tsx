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

  const [a, b] = properties;

  // Helper: returns "better" | "worse" | "equal" for numeric comparisons (lower is better by default)
  const compareNumeric = (
    val: number | undefined,
    other: number | undefined,
    lowerIsBetter = true
  ): "better" | "worse" | "equal" => {
    if (val == null || other == null || val === other) return "equal";
    if (lowerIsBetter) return val < other ? "better" : "worse";
    return val > other ? "better" : "worse";
  };

  const compareBool = (val: boolean | undefined, other: boolean | undefined): "better" | "worse" | "equal" => {
    if (val === other) return "equal";
    return val ? "better" : "worse";
  };

  const highlightClass = (result: "better" | "worse" | "equal") => {
    if (result === "better") return "bg-primary/10 text-primary ring-1 ring-primary/20";
    if (result === "worse") return "bg-destructive/10 text-destructive ring-1 ring-destructive/20";
    return "bg-secondary";
  };

  type CompareRow = {
    label: string;
    render: (p: Property) => string;
    compare?: (p: Property, other: Property) => "better" | "worse" | "equal";
  };

  const rows: CompareRow[] = [
    {
      label: "Price",
      render: (p) => `KES ${formatPrice(p.price)}${p.priceUnit}`,
      compare: (p, o) => compareNumeric(p.price, o.price, true),
    },
    { label: "Location", render: (p) => `${p.estate}, ${p.county}` },
    {
      label: "Bedrooms",
      render: (p) => `${p.bedrooms}`,
      compare: (p, o) => compareNumeric(p.bedrooms, o.bedrooms, false),
    },
    {
      label: "Bathrooms",
      render: (p) => `${p.bathrooms}`,
      compare: (p, o) => compareNumeric(p.bathrooms, o.bathrooms, false),
    },
    { label: "Size", render: (p) => p.size || "–" },
    { label: "Floor", render: (p) => p.floor || "–" },
    {
      label: "Deposit",
      render: (p) => p.deposit ? `KES ${formatPrice(p.deposit)}` : "–",
      compare: (p, o) => compareNumeric(p.deposit, o.deposit, true),
    },
    {
      label: "Furnished",
      render: (p) => p.furnished ? "Yes ✓" : "No",
      compare: (p, o) => compareBool(p.furnished, o.furnished),
    },
    {
      label: "Pet Friendly",
      render: (p) => p.petFriendly ? "Yes 🐾" : "No",
      compare: (p, o) => compareBool(p.petFriendly, o.petFriendly),
    },
    {
      label: "Verified",
      render: (p) => p.verified ? "Yes ✓" : "No",
      compare: (p, o) => compareBool(p.verified, o.verified),
    },
    { label: "Response Time", render: (p) => p.landlordResponseTime },
    {
      label: "Rating",
      render: (p) => p.rating ? `${p.rating} ⭐` : "–",
      compare: (p, o) => compareNumeric(p.rating, o.rating, false),
    },
    { label: "Move-in", render: (p) => p.moveInDate || "–" },
  ];

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

        {/* Legend */}
        {properties.length === 2 && (
          <div className="flex items-center gap-4 mt-4 mb-2 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-primary/20 ring-1 ring-primary/30" />
              <span className="text-[10px] text-muted-foreground">Better</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-destructive/20 ring-1 ring-destructive/30" />
              <span className="text-[10px] text-muted-foreground">Worse</span>
            </div>
          </div>
        )}

        {/* Comparison table */}
        <div className="mt-4 space-y-4">
          {rows.map((row) => (
            <div key={row.label}>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">{row.label}</p>
              <div className="flex gap-3">
                {properties.map((p, idx) => {
                  const other = properties[idx === 0 ? 1 : 0];
                  const result = row.compare && properties.length === 2 && other
                    ? row.compare(p, other)
                    : "equal";
                  return (
                    <div
                      key={p.id}
                      className={`w-[200px] shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${highlightClass(result)}`}
                    >
                      {row.render(p)}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Amenities comparison */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Amenities</p>
            <div className="flex gap-3">
              {properties.map((p, idx) => {
                const other = properties[idx === 0 ? 1 : 0];
                return (
                  <div key={p.id} className="w-[200px] shrink-0">
                    <div className="flex flex-wrap gap-1">
                      {p.amenities.map((a) => {
                        const unique = other && !other.amenities.includes(a);
                        return (
                          <span
                            key={a}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                              unique
                                ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                                : "bg-secondary"
                            }`}
                          >
                            {a}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareProperties;

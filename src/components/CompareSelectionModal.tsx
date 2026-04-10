import { useState, useMemo } from "react";
import { X, Check, GitCompare, Search, MapPin, Bed, ShieldCheck } from "lucide-react";
import { properties, type Property } from "@/data/mockData";

interface CompareSelectionModalProps {
  onClose: () => void;
  onCompare: (selected: Property[]) => void;
  segment: string;
  preSelectedId?: string | null;
}

const CompareSelectionModal = ({ onClose, onCompare, segment, preSelectedId }: CompareSelectionModalProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(preSelectedId ? [preSelectedId] : []);
  const [search, setSearch] = useState("");

  const filteredProperties = useMemo(() => {
    let list = properties;
    if (segment === "Short Stays") list = list.filter((p) => p.type === "shortstay");
    else if (segment === "Corporate") list = list.filter((p) => p.corporate);
    else if (segment === "Rentals") list = list.filter((p) => p.type === "rental");

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.estate.toLowerCase().includes(q) ||
          p.county.toLowerCase().includes(q)
      );
    }
    return list;
  }, [segment, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    const selected = properties.filter((p) => selectedIds.includes(p.id));
    if (selected.length === 2) onCompare(selected);
  };

  const formatPrice = (price: number) =>
    price >= 1000 ? `KES ${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K` : `KES ${price}`;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-slide-up">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-foreground" />
          </button>
          <h2 className="text-lg font-bold">Compare Properties</h2>
          <div className="w-9" />
        </div>
        <p className="text-xs text-muted-foreground text-center mb-3">
          Select 2 properties to compare side by side
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Selection indicator */}
        <div className="flex items-center justify-center gap-3 mt-3">
          {[0, 1].map((i) => {
            const selected = selectedIds[i];
            const prop = selected ? properties.find((p) => p.id === selected) : null;
            return (
              <div
                key={i}
                className={`flex-1 h-12 rounded-xl border-2 border-dashed flex items-center justify-center text-xs font-medium transition-all ${
                  prop
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted-foreground/20 text-muted-foreground/40"
                }`}
              >
                {prop ? (
                  <span className="truncate px-2">{prop.title}</span>
                ) : (
                  `Property ${i + 1}`
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Property list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filteredProperties.map((p) => {
          const isSelected = selectedIds.includes(p.id);
          const isDisabled = selectedIds.length >= 2 && !isSelected;

          return (
            <button
              key={p.id}
              onClick={() => !isDisabled && toggleSelect(p.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.98] ${
                isSelected
                  ? "bg-primary/5 ring-2 ring-primary"
                  : isDisabled
                  ? "bg-card opacity-40"
                  : "bg-card card-shadow"
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
              </div>

              {/* Image */}
              <img
                src={p.image}
                alt={p.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />

              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate">{p.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground truncate">
                    {p.estate}, {p.county}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs font-bold text-primary">
                    {formatPrice(p.price)}
                    <span className="font-normal text-muted-foreground">{p.priceUnit}</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Bed className="w-3 h-3" /> {p.bedrooms}
                  </span>
                  {p.verified && <ShieldCheck className="w-3 h-3 text-primary" />}
                </div>
              </div>
            </button>
          );
        })}

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">No properties found</p>
          </div>
        )}
      </div>

      {/* Compare button — sticky bottom */}
      <div className="sticky bottom-0 left-0 right-0 px-4 py-4 border-t border-border bg-background safe-bottom">
        <button
          onClick={handleCompare}
          disabled={selectedIds.length !== 2}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            selectedIds.length === 2
              ? "gradient-trust text-primary-foreground active:scale-[0.98] shadow-lg animate-[bounce_0.4s_ease-out_1]"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <GitCompare className="w-4 h-4" />
          {selectedIds.length === 2
            ? "Compare Now"
            : selectedIds.length === 1
            ? "Select 1 more property"
            : "Select 2 properties to compare"}
        </button>
      </div>
    </div>
  );
};

export default CompareSelectionModal;

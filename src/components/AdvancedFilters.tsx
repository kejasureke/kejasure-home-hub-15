import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useState } from "react";
import LocationSelector from "./LocationSelector";

interface Filters {
  minPrice: number;
  maxPrice: number;
  bedrooms: number[];
  amenities: string[];
  verified: boolean;
  smileIdVerified: boolean;
  furnished: boolean;
  petFriendly: boolean;
  sortBy: string;
}

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (filters: Filters) => void;
  county: string;
  subcounty: string;
  ward: string;
  estate: string;
  onLocationChange: (county: string, subcounty: string, ward: string, estate: string) => void;
}

const bedroomOptions = [1, 2, 3, 4, 5];
const amenityOptions = ["Parking", "Swimming Pool", "Gym", "Security", "Fiber Internet", "Backup Generator", "Elevator", "Balcony", "Garden", "CCTV", "Water Tank", "Borehole"];
const sortOptions = [
  { value: "featured", label: "Featured First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Highest Rated" },
];

const AdvancedFilters = ({ isOpen, onClose, filters, onApply, county, subcounty, ward, estate, onLocationChange }: AdvancedFiltersProps) => {
  const [local, setLocal] = useState<Filters>(filters);

  if (!isOpen) return null;

  const toggleBedroom = (b: number) => {
    setLocal((f) => ({
      ...f,
      bedrooms: f.bedrooms.includes(b) ? f.bedrooms.filter((x) => x !== b) : [...f.bedrooms, b],
    }));
  };

  const toggleAmenity = (a: string) => {
    setLocal((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const activeCount = [
    local.bedrooms.length > 0,
    local.minPrice > 0 || local.maxPrice < 500000,
    local.amenities.length > 0,
    local.verified,
    local.furnished,
    local.petFriendly,
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-background animate-slide-up overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background z-10">
        <button onClick={onClose}>
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full gradient-trust text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </h2>
        <button
          onClick={() => {
            setLocal({ minPrice: 0, maxPrice: 500000, bedrooms: [], amenities: [], verified: false, furnished: false, petFriendly: false, sortBy: "featured" });
          }}
          className="text-xs font-medium text-primary"
        >
          Reset
        </button>
      </div>

      <div className="px-4 py-5 space-y-6 pb-32">
        {/* Location */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Location</h3>
          <LocationSelector
            selectedCounty={county}
            selectedSubcounty={subcounty}
            selectedWard={ward}
            selectedEstate={estate}
            onSelect={(c, sc, w, e) => onLocationChange(c, sc, w, e)}
          />
        </div>

        {/* Sort */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Sort By</h3>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocal((f) => ({ ...f, sortBy: opt.value }))}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  local.sortBy === opt.value
                    ? "gradient-trust text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Price Range (KES)</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Min</label>
              <input
                type="number"
                value={local.minPrice || ""}
                onChange={(e) => setLocal((f) => ({ ...f, minPrice: Number(e.target.value) || 0 }))}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex items-end pb-2.5 text-muted-foreground">–</div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Max</label>
              <input
                type="number"
                value={local.maxPrice >= 500000 ? "" : local.maxPrice}
                onChange={(e) => setLocal((f) => ({ ...f, maxPrice: Number(e.target.value) || 500000 }))}
                placeholder="No limit"
                className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Bedrooms</h3>
          <div className="flex gap-2">
            {bedroomOptions.map((b) => (
              <button
                key={b}
                onClick={() => toggleBedroom(b)}
                className={`w-12 h-12 rounded-xl text-sm font-semibold transition-colors ${
                  local.bedrooms.includes(b)
                    ? "gradient-trust text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {b}{b === 5 ? "+" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Quick toggles */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Property Features</h3>
          <div className="space-y-3">
            {[
              { key: "verified" as const, label: "Verified Only", icon: "✓" },
              { key: "furnished" as const, label: "Furnished", icon: "🏠" },
              { key: "petFriendly" as const, label: "Pet Friendly", icon: "🐾" },
            ].map((toggle) => (
              <button
                key={toggle.key}
                onClick={() => setLocal((f) => ({ ...f, [toggle.key]: !f[toggle.key] }))}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary"
              >
                <span className="text-sm font-medium flex items-center gap-2">
                  <span>{toggle.icon}</span>
                  {toggle.label}
                </span>
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    local[toggle.key] ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${
                      local[toggle.key] ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {amenityOptions.map((a) => (
              <button
                key={a}
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  local.amenities.includes(a)
                    ? "gradient-trust text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Apply button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass-surface border-t border-border safe-bottom">
        <button
          onClick={() => { onApply(local); onClose(); }}
          className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-transform"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default AdvancedFilters;

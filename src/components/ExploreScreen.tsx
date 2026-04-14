import { useState, useMemo } from "react";
import { Search, ArrowLeft, Bed, Home, Sofa, Car, Building2, DoorOpen, Castle, PawPrint, MapPin, Shield, Droplets, Zap, Footprints } from "lucide-react";
import { properties } from "@/data/mockData";
import { neighborhoodProfiles } from "@/data/neighborhoodData";
import PropertyCard from "./PropertyCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

interface Category {
  label: string;
  icon: typeof Bed;
  filter: (p: typeof properties[number]) => boolean;
  color: string;
}

const categories: Category[] = [
  {
    label: "Bedsitters",
    icon: DoorOpen,
    filter: (p) => p.bedrooms === 0 || p.title.toLowerCase().includes("bedsit"),
    color: "bg-primary/10 text-primary",
  },
  {
    label: "1 Bedroom",
    icon: Bed,
    filter: (p) => p.bedrooms === 1,
    color: "bg-trust/10 text-trust",
  },
  {
    label: "2 Bedroom",
    icon: Home,
    filter: (p) => p.bedrooms === 2,
    color: "bg-accent/10 text-accent",
  },
  {
    label: "3+ Bedroom",
    icon: Castle,
    filter: (p) => p.bedrooms >= 3,
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Studio",
    icon: Building2,
    filter: (p) => p.title.toLowerCase().includes("studio"),
    color: "bg-trust/10 text-trust",
  },
  {
    label: "Furnished",
    icon: Sofa,
    filter: (p) => p.furnished === true,
    color: "bg-accent/10 text-accent",
  },
  {
    label: "Pet Friendly",
    icon: PawPrint,
    filter: (p) => p.petFriendly === true,
    color: "bg-primary/10 text-primary",
  },
  {
    label: "With Parking",
    icon: Car,
    filter: (p) => p.amenities.some((a) => a.toLowerCase().includes("parking")),
    color: "bg-trust/10 text-trust",
  },
];

const priceRanges = [
  { label: "Under 20K", min: 0, max: 20000 },
  { label: "20K – 40K", min: 20000, max: 40000 },
  { label: "40K – 70K", min: 40000, max: 70000 },
  { label: "70K+", min: 70000, max: Infinity },
];

const ExploreScreen = () => {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activePriceRange, setActivePriceRange] = useState<typeof priceRanges[number] | null>(null);
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const { addRecent } = useRecentlyViewed();

  const filteredProperties = useMemo(() => {
    let results = properties;

    if (activeCategory) {
      results = results.filter(activeCategory.filter);
    }

    if (activePriceRange) {
      results = results.filter((p) => p.price >= activePriceRange.min && p.price < activePriceRange.max);
    }

    if (activeArea) {
      results = results.filter((p) => p.estate === activeArea);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.estate.toLowerCase().includes(q) ||
          p.nearbyLandmarks.some((l) => l.toLowerCase().includes(q))
      );
    }

    return results;
  }, [activeCategory, activePriceRange, activeArea, searchQuery]);

  const activeLabel = activeCategory?.label || activePriceRange?.label || activeArea || "Search Results";
  const showingResults = activeCategory || activePriceRange || activeArea || searchQuery;

  const clearFilters = () => {
    setActiveCategory(null);
    setActivePriceRange(null);
    setActiveArea(null);
    setSearchQuery("");
  };

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-3 mb-4">
          {showingResults ? (
            <button
              onClick={clearFilters}
              className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
          ) : null}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              {showingResults ? activeLabel : "Explore"}
            </h1>
            {showingResults && (
              <p className="text-xs text-muted-foreground">
                {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} found
              </p>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, estate, or landmark..."
            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-card card-shadow text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {!showingResults ? (
        <div className="px-4">
          {/* Property type categories */}
          <h2 className="text-sm font-semibold text-foreground mb-3">Property Type</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const count = properties.filter(cat.filter).length;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-card card-shadow active:scale-[0.97] transition-all text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                    <p className="text-[10px] text-muted-foreground">{count} listings</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Price range */}
          <h2 className="text-sm font-semibold text-foreground mb-3">By Budget</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {priceRanges.map((range) => {
              const count = properties.filter((p) => p.price >= range.min && p.price < range.max).length;
              return (
                <button
                  key={range.label}
                  onClick={() => setActivePriceRange(range)}
                  className="p-4 rounded-2xl bg-card card-shadow active:scale-[0.97] transition-all text-left"
                >
                  <p className="text-sm font-bold text-primary">{range.label}</p>
                  <p className="text-[10px] text-muted-foreground">{count} listings</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Results */
        <div className="px-4">
          {filteredProperties.length > 0 ? (
            <div className="space-y-4">
              {filteredProperties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onPress={() => addRecent(p.id)}
                  liked={isFavorite(p.id)}
                  onToggleLike={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <Search className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-foreground">No properties found</p>
              <p className="text-xs text-muted-foreground mt-1">Try a different category or search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExploreScreen;

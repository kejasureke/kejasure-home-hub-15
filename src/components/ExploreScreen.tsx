import { useState, useMemo } from "react";
import { Search, ArrowLeft, Bed, Home, Sofa, Car, Building2, DoorOpen, Castle, PawPrint, MapPin, Shield, Droplets, Zap, Footprints, Volume2, Bus, GraduationCap, Cross, ShoppingBag, TreePine, Wifi, ChevronDown, ChevronUp } from "lucide-react";
import { properties } from "@/data/mockData";
import type { Property } from "@/data/mockData";
import { neighborhoodProfiles } from "@/data/neighborhoodData";
import PropertyCard from "./PropertyCard";
import ListingDetail from "./ListingDetail";
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

interface ExploreScreenProps {
  initialSearch?: string;
}

const ExploreScreen = ({ initialSearch = "" }: ExploreScreenProps) => {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activePriceRange, setActivePriceRange] = useState<typeof priceRanges[number] | null>(null);
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [insightsCollapsed, setInsightsCollapsed] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
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

  if (selectedProperty) {
    return (
      <ListingDetail
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
        liked={isFavorite(selectedProperty.id)}
        onToggleLike={() => toggleFavorite(selectedProperty.id)}
      />
    );
  }

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

          {/* By Neighborhood */}
          <h2 className="text-sm font-semibold text-foreground mb-3">By Neighborhood</h2>
          <div className="space-y-3 mb-6">
            {neighborhoodProfiles.map((area) => {
              const listingCount = properties.filter((p) => p.estate === area.estate).length;
              const avgRent = Math.round((area.avgRent1BR + area.avgRent2BR) / 2 / 1000);
              return (
                <button
                  key={area.estate}
                  onClick={() => { setActiveArea(area.estate); setInsightsCollapsed(false); }}
                  className="w-full p-4 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{area.estate}</p>
                        <p className="text-[10px] text-muted-foreground">{area.county} · {listingCount} listings · ~KES {avgRent}K avg</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary">
                      <Shield className="w-3 h-3 text-trust" />
                      <span className="text-[10px] font-medium text-muted-foreground">{area.safetyRating}/10</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary">
                      <Droplets className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-medium text-muted-foreground">{area.waterReliability}/10</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary">
                      <Zap className="w-3 h-3 text-accent" />
                      <span className="text-[10px] font-medium text-muted-foreground">{area.electricityReliability}/10</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary">
                      <Footprints className="w-3 h-3 text-trust" />
                      <span className="text-[10px] font-medium text-muted-foreground">{area.walkabilityScore}/10</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Results */
        <div className="px-4">
          {/* Neighborhood insights panel */}
          {activeArea && (() => {
            const area = neighborhoodProfiles.find((n) => n.estate === activeArea);
            if (!area) return null;
            return (
              <div className="mb-4 rounded-2xl bg-card card-shadow overflow-hidden">
                <button
                  onClick={() => setInsightsCollapsed((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Area Insights</span>
                  </div>
                  {insightsCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {!insightsCollapsed && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-muted-foreground mb-2">{area.summary}</p>

                  {/* Score badges row */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-[10px] font-medium text-muted-foreground">
                      <Shield className="w-3 h-3 text-trust" /> Safety {area.safetyRating}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-[10px] font-medium text-muted-foreground">
                      <Droplets className="w-3 h-3 text-primary" /> Water {area.waterReliability}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-[10px] font-medium text-muted-foreground">
                      <Zap className="w-3 h-3 text-accent" /> Power {area.electricityReliability}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-[10px] font-medium text-muted-foreground">
                      <Footprints className="w-3 h-3 text-trust" /> Walk {area.walkabilityScore}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-[10px] font-medium text-muted-foreground">
                      <Volume2 className="w-3 h-3 text-muted-foreground" /> {area.noiseLevel}
                    </span>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                    <div className="flex items-start gap-1.5">
                      <Bus className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{area.transportOptions.slice(0, 3).join(", ")}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <ShoppingBag className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{area.nearestMall}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <GraduationCap className="w-3 h-3 text-trust mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{area.nearbySchools.slice(0, 2).join(", ")}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Cross className="w-3 h-3 text-destructive mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{area.nearbyHospitals.slice(0, 2).join(", ")}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Wifi className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{area.internetProviders.slice(0, 3).join(", ")}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <TreePine className="w-3 h-3 text-trust mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{area.greenSpaces.slice(0, 2).join(", ")}</span>
                    </div>
                  </div>

                  {/* Avg rents */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-muted-foreground">1BR</p>
                      <p className="text-xs font-bold text-foreground">KES {(area.avgRent1BR / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-muted-foreground">2BR</p>
                      <p className="text-xs font-bold text-foreground">KES {(area.avgRent2BR / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-muted-foreground">3BR</p>
                      <p className="text-xs font-bold text-foreground">KES {(area.avgRent3BR / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-muted-foreground">Roads</p>
                      <p className="text-xs font-bold text-foreground">{area.roadAccess}</p>
                    </div>
                  </div>
                </div>
                )}
              </div>
            );
          })()}
          {filteredProperties.length > 0 ? (
            <div className="space-y-4">
              {filteredProperties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onPress={() => { addRecent(p.id); setSelectedProperty(p); }}
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

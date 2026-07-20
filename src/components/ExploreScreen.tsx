import { useState, useMemo, useEffect } from "react";
import { Search, ArrowLeft, Bed, Home, Sofa, Car, Building2, DoorOpen, Castle, PawPrint, MapPin, Shield, Droplets, Zap, Footprints, Volume2, Bus, GraduationCap, Cross, ShoppingBag, TreePine, Wifi, ChevronDown, ChevronUp, Briefcase, Store, Warehouse, Hotel, Wrench, Truck, Sparkles, Star, Palmtree, Plane, SlidersHorizontal, X } from "lucide-react";
import { haptic } from "@/lib/despia";
import { useHardwareBack } from "@/hooks/useHardwareBack";
import { properties, serviceProviders } from "@/data/mockData";
import type { Property } from "@/data/mockData";
import { neighborhoodProfiles } from "@/data/neighborhoodData";
import PropertyCard from "./PropertyCard";
import ListingDetail from "./ListingDetail";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

type Segment = "Rentals" | "Short Stays" | "Business Spaces" | "Corporate Stay" | "Services";
const segments: Segment[] = ["Rentals", "Short Stays", "Business Spaces", "Corporate Stay", "Services"];

const segmentMatchers: Record<Segment, (p: Property) => boolean> = {
  "Rentals": (p) => p.type === "rental" && !p.corporate,
  "Short Stays": (p) => p.type === "shortstay" && !p.corporate,
  "Business Spaces": (p) => p.type === "commercial",
  "Corporate Stay": (p) => !!p.corporate,
  "Services": () => false,
};

interface Category {
  label: string;
  icon: typeof Bed;
  filter: (p: typeof properties[number]) => boolean;
  color: string;
}

const rentalCategories: Category[] = [
  { label: "Bedsitters", icon: DoorOpen, filter: (p) => p.bedrooms === 0 || p.title.toLowerCase().includes("bedsit"), color: "bg-primary/10 text-primary" },
  { label: "1 Bedroom", icon: Bed, filter: (p) => p.bedrooms === 1, color: "bg-trust/10 text-trust" },
  { label: "2 Bedroom", icon: Home, filter: (p) => p.bedrooms === 2, color: "bg-accent/10 text-accent" },
  { label: "3+ Bedroom", icon: Castle, filter: (p) => p.bedrooms >= 3, color: "bg-primary/10 text-primary" },
  { label: "Studio", icon: Building2, filter: (p) => p.title.toLowerCase().includes("studio"), color: "bg-trust/10 text-trust" },
  { label: "Furnished", icon: Sofa, filter: (p) => p.furnished === true, color: "bg-accent/10 text-accent" },
  { label: "Pet Friendly", icon: PawPrint, filter: (p) => p.petFriendly === true, color: "bg-primary/10 text-primary" },
  { label: "With Parking", icon: Car, filter: (p) => p.amenities.some((a) => a.toLowerCase().includes("parking")), color: "bg-trust/10 text-trust" },
];

const shortStayCategories: Category[] = [
  { label: "Studio Stays", icon: Building2, filter: (p) => p.title.toLowerCase().includes("studio"), color: "bg-primary/10 text-primary" },
  { label: "1BR Apartments", icon: Bed, filter: (p) => p.bedrooms === 1, color: "bg-trust/10 text-trust" },
  { label: "2BR+ Family", icon: Home, filter: (p) => p.bedrooms >= 2, color: "bg-accent/10 text-accent" },
  { label: "Beachfront", icon: Palmtree, filter: (p) => /beach|diani|mombasa|coast/i.test(p.estate + p.title), color: "bg-primary/10 text-primary" },
  { label: "City Center", icon: Building2, filter: (p) => /cbd|westlands|kilimani|upper hill/i.test(p.estate), color: "bg-trust/10 text-trust" },
  { label: "Near Airport", icon: Plane, filter: (p) => /embakasi|syokimau|jkia|airport/i.test(p.estate + p.nearbyLandmarks.join(" ")), color: "bg-accent/10 text-accent" },
];

const commercialCategories: Category[] = [
  { label: "Shops & Retail", icon: Store, filter: (p) => p.commercialType === "shop" || p.commercialType === "supermarket" || p.commercialType === "showroom", color: "bg-primary/10 text-primary" },
  { label: "Offices", icon: Briefcase, filter: (p) => p.commercialType === "office" || p.commercialType === "coworking", color: "bg-trust/10 text-trust" },
  { label: "Godowns & Warehouses", icon: Warehouse, filter: (p) => p.commercialType === "godown" || p.commercialType === "warehouse", color: "bg-accent/10 text-accent" },
  { label: "Hospitality", icon: Hotel, filter: (p) => p.commercialType === "hotel" || p.commercialType === "restaurant" || p.commercialType === "bar" || p.commercialType === "club", color: "bg-primary/10 text-primary" },
  { label: "Health & Wellness", icon: Cross, filter: (p) => p.commercialType === "clinic" || p.commercialType === "pharmacy" || p.commercialType === "gym" || p.commercialType === "salon", color: "bg-trust/10 text-trust" },
  { label: "Industrial & Auto", icon: Wrench, filter: (p) => p.commercialType === "hardware" || p.commercialType === "garage" || p.commercialType === "petrol_station", color: "bg-accent/10 text-accent" },
];

const corporateCategories: Category[] = [
  { label: "Diplomatic Zones", icon: Shield, filter: (p) => /gigiri|runda|muthaiga/i.test(p.estate), color: "bg-primary/10 text-primary" },
  { label: "Serviced Apartments", icon: Sparkles, filter: (p) => p.furnished === true, color: "bg-trust/10 text-trust" },
  { label: "Executive Villas", icon: Castle, filter: (p) => p.bedrooms >= 3, color: "bg-accent/10 text-accent" },
  { label: "City Premium", icon: Building2, filter: (p) => /westlands|kilimani|lavington|kileleshwa/i.test(p.estate), color: "bg-primary/10 text-primary" },
];

const priceRanges = [
  { label: "Under 20K", min: 0, max: 20000 },
  { label: "20K – 40K", min: 20000, max: 40000 },
  { label: "40K – 70K", min: 40000, max: 70000 },
  { label: "70K+", min: 70000, max: Infinity },
];

const shortStayPriceRanges = [
  { label: "Under 3K/night", min: 0, max: 3000 },
  { label: "3K – 6K/night", min: 3000, max: 6000 },
  { label: "6K – 12K/night", min: 6000, max: 12000 },
  { label: "12K+/night", min: 12000, max: Infinity },
];

const commercialPriceRanges = [
  { label: "Under 50K", min: 0, max: 50000 },
  { label: "50K – 150K", min: 50000, max: 150000 },
  { label: "150K – 400K", min: 150000, max: 400000 },
  { label: "400K+", min: 400000, max: Infinity },
];

const corporatePriceRanges = [
  { label: "Under 100K", min: 0, max: 100000 },
  { label: "100K – 250K", min: 100000, max: 250000 },
  { label: "250K – 500K", min: 250000, max: 500000 },
  { label: "500K+", min: 500000, max: Infinity },
];

const serviceCategories = [
  { label: "Movers", icon: Truck, color: "bg-primary/10 text-primary" },
  { label: "Plumbers", icon: Wrench, color: "bg-trust/10 text-trust" },
  { label: "Cleaners", icon: Sparkles, color: "bg-accent/10 text-accent" },
  { label: "Electricians", icon: Zap, color: "bg-primary/10 text-primary" },
  { label: "Security", icon: Shield, color: "bg-trust/10 text-trust" },
  { label: "Painters", icon: Palmtree, color: "bg-accent/10 text-accent" },
];

interface ExploreScreenProps {
  initialSearch?: string;
}

const EXPLORE_SEGMENT_KEY = "kejasure_explore_segment";
const ExploreScreen = ({ initialSearch = "" }: ExploreScreenProps) => {
  const [segment, setSegmentState] = useState<Segment>(() => {
    try {
      const saved = localStorage.getItem(EXPLORE_SEGMENT_KEY) as Segment | null;
      return saved && segments.includes(saved) ? saved : "Rentals";
    } catch { return "Rentals"; }
  });
  const setSegment = (s: Segment) => {
    setSegmentState(s);
    try { localStorage.setItem(EXPLORE_SEGMENT_KEY, s); } catch {}
  };
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activePriceRange, setActivePriceRange] = useState<typeof priceRanges[number] | null>(null);
  const [activeServiceCategory, setActiveServiceCategory] = useState<string | null>(null);
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [insightsCollapsed, setInsightsCollapsed] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showQuickFilter, setShowQuickFilter] = useState(false);
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const { addRecent } = useRecentlyViewed();

  // Reset filters when segment changes
  useEffect(() => {
    setActiveCategory(null);
    setActivePriceRange(null);
    setActiveServiceCategory(null);
    setActiveArea(null);
  }, [segment]);

  const activeCategories: Category[] =
    segment === "Rentals" ? rentalCategories :
    segment === "Short Stays" ? shortStayCategories :
    segment === "Business Spaces" ? commercialCategories :
    segment === "Corporate Stay" ? corporateCategories :
    [];

  const activePriceRanges =
    segment === "Short Stays" ? shortStayPriceRanges :
    segment === "Business Spaces" ? commercialPriceRanges :
    segment === "Corporate Stay" ? corporatePriceRanges :
    priceRanges;

  const segmentProperties = useMemo(
    () => properties.filter(segmentMatchers[segment]),
    [segment]
  );

  const filteredProperties = useMemo(() => {
    let results = segmentProperties;

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
  }, [segmentProperties, activeCategory, activePriceRange, activeArea, searchQuery]);

  const filteredServices = useMemo(() => {
    let results = serviceProviders;
    if (activeServiceCategory) {
      results = results.filter((s) => s.category === activeServiceCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.areaServed.toLowerCase().includes(q)
      );
    }
    return results;
  }, [activeServiceCategory, searchQuery]);

  const activeLabel = activeCategory?.label || activePriceRange?.label || activeArea || activeServiceCategory || "Search Results";
  const showingResults = activeCategory || activePriceRange || activeArea || activeServiceCategory || searchQuery;
  const isServices = segment === "Services";

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
    setActiveServiceCategory(null);
    setActiveArea(null);
    setSearchQuery("");
  };

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="px-4 pt-safe pb-3">
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
                {isServices
                  ? `${filteredServices.length} ${filteredServices.length === 1 ? "provider" : "providers"} found`
                  : `${filteredProperties.length} ${filteredProperties.length === 1 ? "property" : "properties"} found`}
              </p>
            )}
          </div>
        </div>

        {/* Segment selector */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {segments.map((seg) => (
              <button
                key={seg}
                onClick={() => { haptic("light"); setSegment(seg); }}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  segment === seg
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground card-shadow"
                }`}
              >
                {seg}
              </button>
            ))}
          </div>
          <button
            onClick={() => { haptic("light"); setShowQuickFilter(true); }}
            aria-label="Quick filters"
            className="shrink-0 w-9 h-9 rounded-full bg-card card-shadow flex items-center justify-center relative"
          >
            <SlidersHorizontal className="w-4 h-4 text-foreground" />
            {(activeCategory || activePriceRange || activeServiceCategory || activeArea) && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isServices ? "Search providers, category, area..." : "Search by name, estate, or landmark..."}
            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-card card-shadow text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {!showingResults ? (
        <div className="px-4">
          {isServices ? (
            <>
              <h2 className="text-sm font-semibold text-foreground mb-3">Service Categories</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {serviceCategories.map((cat) => {
                  const Icon = cat.icon;
                  const count = serviceProviders.filter((s) => s.category === cat.label).length;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => setActiveServiceCategory(cat.label)}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-card card-shadow active:scale-[0.97] transition-all text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                        <p className="text-[10px] text-muted-foreground">{count} providers</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <h2 className="text-sm font-semibold text-foreground mb-3">Top Rated</h2>
              <div className="space-y-3 mb-6">
                {[...serviceProviders].sort((a, b) => b.rating - a.rating).slice(0, 4).map((sp) => (
                  <div key={sp.id} className="w-full p-4 rounded-2xl bg-card card-shadow flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                      {sp.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{sp.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{sp.category} · {sp.areaServed}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        <span className="text-[11px] font-medium text-foreground">{sp.rating}</span>
                        <span className="text-[10px] text-muted-foreground">({sp.reviews})</span>
                      </div>
                    </div>
                    {sp.tier === "Premium" && (
                      <span className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-[10px] font-semibold">Premium</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-sm font-semibold text-foreground mb-3">
                {segment === "Business Spaces" ? "Space Type" : segment === "Corporate Stay" ? "Premium Categories" : segment === "Short Stays" ? "Stay Type" : "Property Type"}
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {activeCategories.map((cat) => {
                  const Icon = cat.icon;
                  const count = segmentProperties.filter(cat.filter).length;
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

              <h2 className="text-sm font-semibold text-foreground mb-3">By Budget</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {activePriceRanges.map((range) => {
                  const count = segmentProperties.filter((p) => p.price >= range.min && p.price < range.max).length;
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

              <h2 className="text-sm font-semibold text-foreground mb-3">By Neighborhood</h2>
              <div className="space-y-3 mb-6">
                {neighborhoodProfiles.map((area) => {
                  const listingCount = segmentProperties.filter((p) => p.estate === area.estate).length;
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
            </>
          )}
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
          {isServices ? (
            filteredServices.length > 0 ? (
              <div className="space-y-3">
                {filteredServices.map((sp) => (
                  <div key={sp.id} className="w-full p-4 rounded-2xl bg-card card-shadow flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                      {sp.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{sp.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{sp.category} · {sp.areaServed}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-accent fill-accent" />
                          <span className="text-[11px] font-medium text-foreground">{sp.rating}</span>
                          <span className="text-[10px] text-muted-foreground">({sp.reviews})</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">· {sp.price}</span>
                      </div>
                    </div>
                    {sp.tier === "Premium" && (
                      <span className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-[10px] font-semibold">Premium</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <Search className="w-10 h-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-foreground">No providers found</p>
                <p className="text-xs text-muted-foreground mt-1">Try a different category or search term</p>
              </div>
            )
          ) : filteredProperties.length > 0 ? (
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

      {/* Quick filter bottom sheet */}
      {showQuickFilter && (
        <QuickFilterSheet
          segment={segment}
          isServices={isServices}
          categories={categories}
          priceRanges={activePriceRanges}
          serviceCategories={serviceCategories}
          activeCategory={activeCategory}
          activePriceRange={activePriceRange}
          activeServiceCategory={activeServiceCategory}
          onSelectCategory={setActiveCategory}
          onSelectPriceRange={setActivePriceRange}
          onSelectServiceCategory={setActiveServiceCategory}
          onClearAll={() => { setActiveCategory(null); setActivePriceRange(null); setActiveServiceCategory(null); setActiveArea(null); }}
          onClose={() => setShowQuickFilter(false)}
        />
      )}
    </div>
  );
};

export default ExploreScreen;

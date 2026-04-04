import { Search, Bell, SlidersHorizontal, GitCompare, Bookmark, BookmarkCheck, ChevronRight, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import LocationSelector from "./LocationSelector";
import PropertyCard from "./PropertyCard";
import ServiceCard from "./ServiceCard";
import ListingDetail from "./ListingDetail";
import AdvancedFilters from "./AdvancedFilters";
import CompareProperties from "./CompareProperties";
import { properties, serviceProviders } from "@/data/mockData";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useFavorites } from "@/hooks/useFavorites";
import { useSavedSearches } from "@/hooks/useSavedSearches";

const segments = ["Rentals", "Short Stays", "Services"] as const;

const HomeFeed = () => {
  const [segment, setSegment] = useState<(typeof segments)[number]>("Rentals");
  const [county, setCounty] = useState("");
  const [subcounty, setSubcounty] = useState("");
  const [ward, setWard] = useState("");
  const [estate, setEstate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [serviceCategory, setServiceCategory] = useState("All");
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 500000,
    bedrooms: [] as number[],
    amenities: [] as string[],
    verified: false,
    furnished: false,
    petFriendly: false,
    sortBy: "featured",
  });

  const { recentIds, addRecent } = useRecentlyViewed();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const { searches, saveSearch, removeSearch } = useSavedSearches();

  const filteredProperties = useMemo(() => {
    let result = properties.filter((p) => {
      const matchType = segment === "Rentals" ? p.type === "rental" : p.type === "shortstay";
      const matchCounty = !county || p.county === county;
      const matchEstate = !estate || p.estate === estate;
      const matchSearch = !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.estate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nearbyLandmarks.some((l) => l.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchPrice = p.price >= filters.minPrice && p.price <= filters.maxPrice;
      const matchBedrooms = filters.bedrooms.length === 0 || filters.bedrooms.includes(p.bedrooms);
      const matchAmenities = filters.amenities.length === 0 || filters.amenities.every((a) => p.amenities.includes(a));
      const matchVerified = !filters.verified || p.verified;
      const matchFurnished = !filters.furnished || p.furnished;
      const matchPets = !filters.petFriendly || p.petFriendly;
      return matchType && matchCounty && matchEstate && matchSearch && matchPrice && matchBedrooms && matchAmenities && matchVerified && matchFurnished && matchPets;
    });

    // Sort
    switch (filters.sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "featured": result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }

    return result;
  }, [segment, county, estate, searchQuery, filters]);

  const recentProperties = properties.filter((p) => recentIds.includes(p.id));
  const compareProperties = properties.filter((p) => compareIds.includes(p.id));

  const filteredServices = serviceCategory === "All"
    ? serviceProviders
    : serviceProviders.filter((s) => s.category === serviceCategory);

  const handleSelectProperty = (id: string) => {
    addRecent(id);
    setSelectedProperty(id);
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const property = selectedProperty ? properties.find((p) => p.id === selectedProperty) : null;

  if (property) {
    return (
      <ListingDetail
        property={property}
        onBack={() => setSelectedProperty(null)}
        liked={isFavorite(property.id)}
        onToggleLike={() => toggleFavorite(property.id)}
      />
    );
  }

  if (showCompare && compareProperties.length > 0) {
    return (
      <CompareProperties
        properties={compareProperties}
        onClose={() => setShowCompare(false)}
        onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
      />
    );
  }

  const handleSaveSearch = () => {
    const label = [estate, ward, subcounty, county].filter(Boolean).join(", ") || "All Kenya";
    saveSearch({ label, county, subcounty: subcounty, estate, segment });
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="gradient-trust px-4 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-2 justify-end">
          <button
            onClick={handleSaveSearch}
            className="w-10 h-10 rounded-full bg-primary-foreground/15 flex items-center justify-center"
          >
            <Bookmark className="w-4 h-4 text-primary-foreground" />
          </button>
          <button className="relative w-10 h-10 rounded-full bg-primary-foreground/15 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-foreground" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search properties, estates, landmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 rounded-xl bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 card-shadow"
          />
          <button onClick={() => setShowFilters(true)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-secondary relative">
            <SlidersHorizontal className="w-4 h-4 text-foreground" />
            {(county || filters.bedrooms.length > 0 || filters.amenities.length > 0 || filters.verified || filters.furnished || filters.petFriendly) && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent" />
            )}
          </button>
        </div>
      </div>

      {/* Saved Searches */}
      {searches.length > 0 && (
        <div className="px-4 py-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {searches.slice(0, 5).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setCounty(s.county);
                  setSubcounty(s.subcounty);
                  setEstate(s.estate);
                  setSegment(s.segment as any);
                }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 text-xs font-medium text-primary border border-primary/15"
              >
                <BookmarkCheck className="w-3 h-3" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Segment Tabs */}
      <div className="px-4 py-3">
        <div className="flex gap-1 p-1 rounded-xl bg-secondary">
          {segments.map((seg) => (
            <button
              key={seg}
              onClick={() => setSegment(seg)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                segment === seg
                  ? "bg-card card-shadow text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {segment === "Services" ? (
          <div className="space-y-3">
            <h2 className="text-base font-semibold">Popular Services</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {["All", "Movers", "Cleaners", "Electricians", "Plumbers", "Internet Installers", "Security"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setServiceCategory(cat)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-colors ${
                    serviceCategory === cat
                      ? "gradient-trust text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {filteredServices.map((sp) => (
              <ServiceCard key={sp.id} provider={sp} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Compare toolbar */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {filteredProperties.length} {segment === "Short Stays" ? "stays" : "properties"} found
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setCompareMode(!compareMode); if (compareMode) setCompareIds([]); }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    compareMode ? "gradient-trust text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <GitCompare className="w-3 h-3" />
                  Compare
                </button>
              </div>
            </div>

            {/* Compare banner */}
            {compareMode && compareIds.length > 0 && (
              <button
                onClick={() => setShowCompare(true)}
                className="w-full py-3 rounded-xl gradient-trust text-sm font-semibold text-primary-foreground flex items-center justify-center gap-2 animate-fade-in"
              >
                Compare {compareIds.length} Properties
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Recently viewed */}
            {recentProperties.length > 0 && !searchQuery && !county && (
              <div>
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Recently Viewed
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {recentProperties.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProperty(p.id)}
                      className="shrink-0 w-[160px] bg-card rounded-2xl card-shadow overflow-hidden"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold line-clamp-1">{p.title}</p>
                        <p className="text-xs font-bold text-primary mt-0.5">
                          KES {(p.price / 1000).toFixed(0)}K<span className="font-normal text-muted-foreground">{p.priceUnit}</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Smart recommendations */}
            {!searchQuery && !county && (
              <div>
                <h2 className="text-base font-semibold mb-3">✨ Recommended for You</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {properties
                    .filter((p) => p.verified && p.rating && p.rating >= 4.5)
                    .slice(0, 4)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectProperty(p.id)}
                        className="shrink-0 w-[200px] bg-card rounded-2xl card-shadow overflow-hidden"
                      >
                        <div className="aspect-[16/10] overflow-hidden relative">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-trust/90 text-[10px] font-semibold text-trust-foreground">
                            ⭐ {p.rating}
                          </div>
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-semibold line-clamp-1">{p.title}</p>
                          <p className="text-[10px] text-muted-foreground">{p.estate}, {p.county}</p>
                          <p className="text-xs font-bold text-primary mt-1">
                            KES {new Intl.NumberFormat("en-KE").format(p.price)}<span className="font-normal text-muted-foreground">{p.priceUnit}</span>
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Featured section */}
            {filteredProperties.some((p) => p.featured) && (
              <div>
                <h2 className="text-base font-semibold mb-3">
                  {segment === "Short Stays" ? "⭐ Top-Rated Stays" : "⭐ Featured Properties"}
                </h2>
                {filteredProperties
                  .filter((p) => p.featured)
                  .map((p) => (
                    <PropertyCard
                      key={p.id}
                      property={p}
                      onPress={handleSelectProperty}
                      liked={isFavorite(p.id)}
                      onToggleLike={toggleFavorite}
                      compareMode={compareMode}
                      isComparing={compareIds.includes(p.id)}
                      onToggleCompare={toggleCompare}
                    />
                  ))}
              </div>
            )}

            <h2 className="text-base font-semibold">
              {segment === "Short Stays" ? "All Short Stays" : "All Rentals"}
            </h2>
            <div className="space-y-4">
              {filteredProperties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onPress={handleSelectProperty}
                  liked={isFavorite(p.id)}
                  onToggleLike={toggleFavorite}
                  compareMode={compareMode}
                  isComparing={compareIds.includes(p.id)}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">Keja Safi, Keja Sure.</p>
                <p className="text-xs text-muted-foreground mt-1">No properties found in this area</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AdvancedFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={setFilters}
      />
    </div>
  );
};

export default HomeFeed;

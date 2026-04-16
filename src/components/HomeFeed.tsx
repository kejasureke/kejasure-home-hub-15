import { Search, SlidersHorizontal, GitCompare, BookmarkCheck, ChevronRight, Clock, MapPin, Navigation, Wrench, Sparkles, Building2 } from "lucide-react";
import { useState, useMemo } from "react";

import PropertyCard from "./PropertyCard";
import ServiceCard from "./ServiceCard";
import ListingDetail from "./ListingDetail";
import AdvancedFilters from "./AdvancedFilters";
import CompareProperties from "./CompareProperties";
import CompareSelectionModal from "./CompareSelectionModal";
import AIPropertyMatch from "./AIPropertyMatch";
import NeighborhoodIntelligence from "./NeighborhoodIntelligence";
import { properties, serviceProviders } from "@/data/mockData";
import MapDiscovery from "./MapDiscovery";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useFavorites } from "@/hooks/useFavorites";
import { useSavedSearches } from "@/hooks/useSavedSearches";

const segments = ["Rentals", "Short Stays", "Business Spaces", "Corporate Stay", "Services"] as const;

const HomeFeed = () => {
  const [segment, setSegment] = useState<(typeof segments)[number]>("Rentals");
  const [county, setCounty] = useState("");
  const [subcounty, setSubcounty] = useState("");
  const [ward, setWard] = useState("");
  const [estate, setEstate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showCompareSelector, setShowCompareSelector] = useState(false);
  const [compareFromProperty, setCompareFromProperty] = useState<string | null>(null);
  const [serviceCategory, setServiceCategory] = useState("All");
  const [commCategory, setCommCategory] = useState("All");
  const [showMap, setShowMap] = useState(false);
  const [showAIMatch, setShowAIMatch] = useState(false);
  const [showNeighborhood, setShowNeighborhood] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 500000,
    bedrooms: [] as number[],
    amenities: [] as string[],
    verified: false,
    smileIdVerified: false,
    furnished: false,
    petFriendly: false,
    sortBy: "featured",
    commercialTypes: [] as string[],
    minSqft: 0,
    maxSqft: 100000,
  });

  const { recentIds, addRecent } = useRecentlyViewed();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const { searches, saveSearch, removeSearch } = useSavedSearches();

  const filteredProperties = useMemo(() => {
    let result = properties.filter((p) => {
      const matchType = segment === "Rentals" ? (p.type === "rental" && !p.corporate) :
                        segment === "Short Stays" ? (p.type === "shortstay" && !p.corporate) :
                        segment === "Business Spaces" ? p.type === "commercial" :
                        segment === "Corporate Stay" ? !!p.corporate :
                        true;
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
      const matchSmileId = !filters.smileIdVerified || p.verified;
      const matchFurnished = !filters.furnished || p.furnished;
      const matchPets = !filters.petFriendly || p.petFriendly;
      const matchCommType = filters.commercialTypes.length === 0 || (p.commercialType && filters.commercialTypes.includes(p.commercialType));
      const matchCommCategory = commCategory === "All" || p.commercialType === commCategory;
      const parseSqft = (s?: string) => parseInt((s || "0").replace(/,/g, ""), 10) || 0;
      const sqft = parseSqft(p.sizeSqft);
      const matchSqft = filters.minSqft === 0 && filters.maxSqft >= 100000 || !p.sizeSqft || (sqft >= filters.minSqft && sqft <= filters.maxSqft);
      return matchType && matchCounty && matchEstate && matchSearch && matchPrice && matchBedrooms && matchAmenities && matchVerified && matchSmileId && matchFurnished && matchPets && matchCommType && matchCommCategory && matchSqft;
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


  const property = selectedProperty ? properties.find((p) => p.id === selectedProperty) : null;

  if (property) {
    return (
      <ListingDetail
        property={property}
        onBack={() => setSelectedProperty(null)}
        liked={isFavorite(property.id)}
        onToggleLike={() => toggleFavorite(property.id)}
        onCompareWith={(p) => {
          setCompareFromProperty(p.id);
          setSelectedProperty(null);
          setShowCompareSelector(true);
        }}
      />
    );
  }

  if (showCompare && compareProperties.length > 0) {
    return (
      <CompareProperties
        properties={compareProperties}
        onClose={() => { setShowCompare(false); setCompareIds([]); }}
        onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
      />
    );
  }

  if (showCompareSelector) {
    return (
      <CompareSelectionModal
        segment={segment}
        preSelectedId={compareFromProperty}
        onClose={() => { setShowCompareSelector(false); setCompareFromProperty(null); }}
        onCompare={(selected) => {
          setCompareIds(selected.map((p) => p.id));
          setShowCompareSelector(false);
          setCompareFromProperty(null);
          setShowCompare(true);
        }}
      />
    );
  }

  if (showAIMatch) {
    return (
      <AIPropertyMatch
        onBack={() => setShowAIMatch(false)}
        onSelectProperty={(id) => { setShowAIMatch(false); handleSelectProperty(id); }}
      />
    );
  }

  if (showNeighborhood) {
    return (
      <NeighborhoodIntelligence onBack={() => setShowNeighborhood(false)} />
    );
  }

  if (showMap) {
    return (
      <MapDiscovery
        onBack={() => setShowMap(false)}
        onSelectProperty={(id) => { setShowMap(false); handleSelectProperty(id); }}
      />
    );
  }

  const handleSaveSearch = () => {
    const label = [estate, ward, subcounty, county].filter(Boolean).join(", ") || "All Kenya";
    saveSearch({ label, county, subcounty: subcounty, estate, segment });
  };

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="gradient-trust px-4 pt-6 pb-5">
        {/* Greeting */}
        {(() => {
          const hour = new Date().getHours();
          const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
          const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
          const tagline = hour < 6
            ? pick(["Up early? Catch the best deals 🌅", "Early bird gets the best keja 🐦", "Fresh listings just for you 🌄"])
            : hour < 12
            ? pick(["Start your day with fresh listings ☀️", "Morning vibes, new spaces 🏠", "Your dream keja awaits ✨"])
            : hour < 17
            ? pick(["Great spaces are waiting for you 🏡", "Afternoon hunt? Let's go! 🔍", "Perfect time to find your spot 📍"])
            : hour < 21
            ? pick(["Wind down with great listings 🌙", "Evening browsing, smart choices 🌆", "Relax and explore new spaces 🛋️"])
            : pick(["Browse listings before bed 🛏️", "Late-night deals are the best 🌜", "Can't sleep? Find your next keja 🏘️"]);
          const name = (() => { try { const n = localStorage.getItem("kejasure_first_name"); return n || "there"; } catch { return "there"; } })();
          return (
            <div className="mb-3 animate-fade-in">
              <p className="text-base font-bold text-white">
                {greeting}, {name}!{" "}
                <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite] origin-[70%_70%]">👋</span>
              </p>
              <p className="text-xs text-white/70 mt-0.5">{tagline}</p>
            </div>
          );
        })()}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search properties, estates, landmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-11 py-3 rounded-xl bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 card-shadow"
          />
          <button onClick={() => setShowFilters(true)} className="absolute right-1.5 p-2 rounded-lg hover:bg-secondary/80 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            {(county || filters.bedrooms.length > 0 || filters.amenities.length > 0 || filters.verified || filters.furnished || filters.petFriendly) && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent" />
            )}
          </button>
        </div>

        {/* Active Filter Chips */}
        {(commCategory !== "All" || county || filters.commercialTypes.length > 0 || filters.bedrooms.length > 0 || filters.amenities.length > 0 || filters.verified || filters.furnished) && (
          <div className="flex gap-1.5 mt-2.5 overflow-x-auto scrollbar-none">
            {commCategory !== "All" && (
              <button
                onClick={() => setCommCategory("All")}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-semibold animate-scale-in"
              >
                {commCategory.replace(/_/g, " ")}
                <X className="w-3 h-3" />
              </button>
            )}
            {county && (
              <button
                onClick={() => { setCounty(""); setSubcounty(""); setWard(""); setEstate(""); }}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-semibold animate-scale-in"
              >
                {estate || county}
                <X className="w-3 h-3" />
              </button>
            )}
            {filters.commercialTypes.map((t) => (
              <button
                key={t}
                onClick={() => setFilters(f => ({ ...f, commercialTypes: f.commercialTypes.filter(x => x !== t) }))}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/20 text-accent-foreground text-[11px] font-semibold animate-scale-in capitalize"
              >
                {t.replace(/_/g, " ")}
                <X className="w-3 h-3" />
              </button>
            ))}
            {filters.bedrooms.length > 0 && (
              <button
                onClick={() => setFilters(f => ({ ...f, bedrooms: [] }))}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-[11px] font-semibold animate-scale-in"
              >
                {filters.bedrooms.join(",")} Bed
                <X className="w-3 h-3" />
              </button>
            )}
            {filters.verified && (
              <button
                onClick={() => setFilters(f => ({ ...f, verified: false }))}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-[11px] font-semibold animate-scale-in"
              >
                Verified
                <X className="w-3 h-3" />
              </button>
            )}
            {filters.furnished && (
              <button
                onClick={() => setFilters(f => ({ ...f, furnished: false }))}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-[11px] font-semibold animate-scale-in"
              >
                Furnished
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowAIMatch(true)}
            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card/20 backdrop-blur-sm active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-primary-foreground" />
            <span className="text-xs font-semibold text-primary-foreground">Keja AI Match</span>
          </button>
          <button
            onClick={() => setShowNeighborhood(true)}
            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-card/20 backdrop-blur-sm active:scale-95 transition-transform"
          >
            <Building2 className="w-4 h-4 text-primary-foreground" />
            <span className="text-xs font-semibold text-primary-foreground">Area Intel</span>
          </button>
        </div>
      </div>


      {/* Segment Tabs */}
      <div className="px-4 py-3">
        <div className="flex gap-1 p-1 rounded-xl bg-secondary">
          {segments.map((seg) => (
            <button
              key={seg}
              onClick={() => setSegment(seg)}
              className={`flex-1 py-2 rounded-lg text-[10px] leading-tight font-semibold transition-all duration-200 text-center ${
                segment === seg
                  ? "bg-card card-shadow text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {seg.includes(" ") ? (
                <>
                  {seg.split(" ")[0]}
                  <br />
                  {seg.split(" ").slice(1).join(" ")}
                </>
              ) : seg}
            </button>
          ))}
        </div>
      </div>

      {/* Business Spaces Category Carousel */}
      {segment === "Business Spaces" && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { value: "All", icon: "🏢", label: "All" },
              { value: "shop", icon: "🏪", label: "Shop" },
              { value: "office", icon: "🏢", label: "Office" },
              { value: "godown", icon: "🏭", label: "Godown" },
              { value: "showroom", icon: "🏬", label: "Showroom" },
              { value: "clinic", icon: "🏥", label: "Clinic" },
              { value: "hotel", icon: "🏨", label: "Hotel" },
              { value: "restaurant", icon: "🍽️", label: "Restaurant" },
              { value: "salon", icon: "💇", label: "Salon" },
              { value: "pharmacy", icon: "💊", label: "Pharmacy" },
              { value: "gym", icon: "🏋️", label: "Gym" },
              { value: "school", icon: "🏫", label: "School" },
              { value: "church", icon: "⛪", label: "Church" },
              { value: "petrol_station", icon: "⛽", label: "Petrol" },
              { value: "bar", icon: "🍺", label: "Bar" },
              { value: "club", icon: "🎵", label: "Club" },
              { value: "supermarket", icon: "🛒", label: "Market" },
              { value: "hardware", icon: "🔧", label: "Hardware" },
              { value: "garage", icon: "🔩", label: "Garage" },
              { value: "studio", icon: "🎨", label: "Studio" },
              { value: "coworking", icon: "💻", label: "Co-Work" },
            ].map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCommCategory(cat.value)}
                className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-center transition-all duration-200 ${
                  commCategory === cat.value
                    ? "bg-primary/15 ring-1 ring-primary/30 scale-105"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className={`text-[10px] font-semibold leading-none ${
                  commCategory === cat.value ? "text-primary" : "text-muted-foreground"
                }`}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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
                  onClick={() => setShowMap(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                >
                  <MapPin className="w-3 h-3" />
                  Map
                </button>
                <button
                  onClick={() => setShowCompareSelector(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                >
                  <GitCompare className="w-3 h-3" />
                  Compare
                </button>
              </div>
            </div>

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

            {/* Nearby Rentals */}
            {!searchQuery && !county && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary" />
                    Nearby Rentals
                  </h2>
                  <button onClick={() => setShowMap(true)} className="text-xs font-medium text-primary">
                    View Map →
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {properties
                    .filter((p) => p.type === "rental" && p.county === "Nairobi")
                    .slice(0, 4)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectProperty(p.id)}
                        className="shrink-0 w-[160px] bg-card rounded-2xl card-shadow overflow-hidden"
                      >
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-card/90 text-[10px] font-bold text-foreground">
                            {(Math.random() * 2 + 0.3).toFixed(1)} km
                          </div>
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

            {/* Nearby Services */}
            {!searchQuery && !county && (
              <div>
                <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-accent" />
                  Nearby Services
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {serviceProviders.slice(0, 4).map((sp) => (
                    <div
                      key={sp.id}
                      className="shrink-0 w-[140px] p-3 bg-card rounded-2xl card-shadow text-center"
                    >
                      <div className="text-2xl mb-2">{sp.avatar}</div>
                      <p className="text-xs font-semibold line-clamp-1">{sp.name}</p>
                      <p className="text-[10px] text-muted-foreground">{sp.category}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-[10px] font-bold text-accent">⭐ {sp.rating}</span>
                      </div>
                    </div>
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
                    />
                  ))}
              </div>
            )}

            <h2 className="text-base font-semibold">
              {segment === "Short Stays" ? "All Short Stays" : segment === "Corporate Stay" ? "All Corporate & Expat Listings" : segment === "Business Spaces" ? "All Business Spaces" : "All Rentals"}
            </h2>
            <div className="space-y-4">
              {filteredProperties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onPress={handleSelectProperty}
                  liked={isFavorite(p.id)}
                  onToggleLike={toggleFavorite}
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
        county={county}
        subcounty={subcounty}
        ward={ward}
        estate={estate}
        onLocationChange={(c, sc, w, e) => { setCounty(c); setSubcounty(sc); setWard(w); setEstate(e); }}
        segment={segment}
      />
    </div>
  );
};

export default HomeFeed;

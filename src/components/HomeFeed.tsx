import { Search, SlidersHorizontal, GitCompare, BookmarkCheck, ChevronRight, Clock, MapPin, Navigation, Wrench, Sparkles, Building2, X, BookmarkPlus, Bookmark, SearchX, TrendingUp } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { PropertyCardSkeleton } from "./Skeleton";
import { formatRelativeTime } from "@/hooks/useRecentlyViewed";

import PropertyCard from "./PropertyCard";
import ServiceCard from "./ServiceCard";
import ListingDetail from "./ListingDetail";
import AdvancedFilters from "./AdvancedFilters";
import CompareProperties from "./CompareProperties";
import CompareSelectionModal from "./CompareSelectionModal";
import AIPropertyMatch from "./AIPropertyMatch";
import NeighborhoodIntelligence from "./NeighborhoodIntelligence";
import PullToRefresh from "./PullToRefresh";
import { properties, serviceProviders } from "@/data/mockData";
import MapDiscovery from "./MapDiscovery";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useFavorites } from "@/hooks/useFavorites";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { useHardwareBack } from "@/hooks/useHardwareBack";

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
  const [serviceSort, setServiceSort] = useState<"featured" | "rating" | "reviews">("featured");
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

  const { recentIds, recentMap, addRecent } = useRecentlyViewed();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  const { searches, saveSearch, removeSearch } = useSavedSearches();

  // Skeleton on segment change / first mount for perceived speed
  const [loadingSegment, setLoadingSegment] = useState(true);
  useEffect(() => {
    setLoadingSegment(true);
    const t = setTimeout(() => setLoadingSegment(false), 320);
    return () => clearTimeout(t);
  }, [segment]);

  // Search suggestions state
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("kejasure_recent_queries") || "[]"); } catch { return []; }
  });
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const commitQuery = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recentQueries.filter(x => x.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
    setRecentQueries(next);
    try { localStorage.setItem("kejasure_recent_queries", JSON.stringify(next)); } catch {}
  };
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) setSearchFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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

  const filteredServices = (() => {
    let list = serviceCategory === "All"
      ? [...serviceProviders]
      : serviceProviders.filter((s) => s.category === serviceCategory);
    if (serviceSort === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (serviceSort === "reviews") list.sort((a, b) => b.reviews - a.reviews);
    return list;
  })();

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

  const handleRefresh = async () => {
    await new Promise((r) => setTimeout(r, 700));
    toast("Feed refreshed");
  };

  // Android hardware back — close overlays before allowing app exit.
  useHardwareBack(showFilters, () => setShowFilters(false));
  useHardwareBack(showCompareSelector, () => {
    setShowCompareSelector(false);
    setCompareFromProperty(null);
  });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="pb-32">
      {/* Header */}
      <div className="gradient-trust px-4 pt-safe pb-5">
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
        <div ref={searchWrapRef} className="relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search properties, estates, landmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => { if (e.key === "Enter") { commitQuery(searchQuery); setSearchFocused(false); (e.target as HTMLInputElement).blur(); } }}
              className="w-full pl-10 pr-11 py-3 rounded-xl bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 card-shadow"
            />
            {(() => {
              const count = [
                commCategory !== "All",
                !!county,
                filters.bedrooms.length > 0,
                filters.amenities.length > 0,
                filters.commercialTypes.length > 0,
                filters.verified,
                filters.furnished,
                filters.petFriendly,
                filters.minPrice > 0 || filters.maxPrice < 500000,
                filters.minSqft > 0 || filters.maxSqft < 100000,
              ].filter(Boolean).length;
              return (
                <button onClick={() => setShowFilters(true)} className="absolute right-1.5 p-2 rounded-lg hover:bg-secondary/80 transition-colors">
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                  {count > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full gradient-trust flex items-center justify-center px-1">
                      <span className="text-[9px] font-bold text-primary-foreground">{count}</span>
                    </div>
                  )}
                </button>
              );
            })()}
          </div>

          {/* Search Suggestions Dropdown */}
          {searchFocused && (recentQueries.length > 0 || !searchQuery) && (
            <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-card rounded-xl card-shadow border border-border overflow-hidden animate-fade-in">
              {recentQueries.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-1 pb-1.5">Recent searches</p>
                  {recentQueries.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setSearchQuery(q); commitQuery(q); setSearchFocused(false); }}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs text-foreground hover:bg-secondary active:scale-[0.98] transition-all"
                    >
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate">{q}</span>
                      <X
                        className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = recentQueries.filter(x => x !== q);
                          setRecentQueries(next);
                          try { localStorage.setItem("kejasure_recent_queries", JSON.stringify(next)); } catch {}
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
              <div className="p-2 border-t border-border">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 pt-1 pb-1.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Trending
                </p>
                {["Kilimani 2BR", "Westlands furnished", "Diani short stay", "Karen villa", "CBD office"].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setSearchQuery(q); commitQuery(q); setSearchFocused(false); }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs text-foreground hover:bg-secondary active:scale-[0.98] transition-all"
                  >
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Chips */}
        {(() => {
          const activeChips = [
            commCategory !== "All",
            !!county,
            ...filters.commercialTypes.map(() => true),
            filters.bedrooms.length > 0,
            filters.verified,
            filters.furnished,
          ].filter(Boolean).length;
          if (activeChips === 0) return null;
          const clearAll = () => {
            setCommCategory("All");
            setCounty(""); setSubcounty(""); setWard(""); setEstate("");
            setFilters(f => ({ ...f, commercialTypes: [], bedrooms: [], verified: false, furnished: false, amenities: [] }));
          };
          return (
            <div className="flex gap-1.5 mt-2.5 overflow-x-auto scrollbar-none">
              {activeChips >= 2 && (
                <button
                  onClick={clearAll}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/15 text-destructive text-[11px] font-semibold animate-scale-in"
                >
                  Clear all
                  <X className="w-3 h-3" />
                </button>
              )}
              {commCategory !== "All" && (
                <button
                  onClick={() => setCommCategory("All")}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[11px] font-semibold animate-scale-in capitalize"
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
          );
        })()}

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
              onClick={() => { setSegment(seg); if (seg !== "Business Spaces") setCommCategory("All"); }}
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

      {/* Saved Searches Rail */}
      {(() => {
        const hasActiveLocationOrSearch = !!county || !!estate || !!searchQuery;
        const segmentSearches = searches.filter((s) => s.segment === segment);
        if (segmentSearches.length === 0 && !hasActiveLocationOrSearch) return null;

        // Detect if current search is already saved
        const currentLabel = [estate, ward, subcounty, county].filter(Boolean).join(", ") || (searchQuery ? `"${searchQuery}"` : "");
        const alreadySaved = segmentSearches.some(
          (s) => s.county === county && s.estate === estate && s.subcounty === subcounty
        );

        return (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">My Searches</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {hasActiveLocationOrSearch && !alreadySaved && (county || estate) && (
                <button
                  onClick={handleSaveSearch}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 ring-1 ring-primary/30 text-primary text-[11px] font-semibold active:scale-95 transition-transform"
                >
                  <BookmarkPlus className="w-3 h-3" />
                  Save "{currentLabel || "current"}"
                </button>
              )}
              {segmentSearches.slice(0, 8).map((s) => {
                const isActive = s.county === county && s.estate === estate;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (isActive) {
                        setCounty(""); setSubcounty(""); setWard(""); setEstate("");
                      } else {
                        setCounty(s.county); setSubcounty(s.subcounty); setWard(""); setEstate(s.estate);
                      }
                    }}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                      isActive
                        ? "gradient-trust text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <Bookmark className={`w-3 h-3 ${isActive ? "fill-current" : ""}`} />
                    {s.label}
                    <X
                      className="w-3 h-3 opacity-60 hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); removeSearch(s.id); }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

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
              {[
                { value: "All", icon: "🔧", label: "All" },
                { value: "Movers", icon: "🚛", label: "Movers" },
                { value: "Cleaners", icon: "🧹", label: "Cleaners" },
                { value: "Electricians", icon: "⚡", label: "Electricians" },
                { value: "Plumbers", icon: "🔧", label: "Plumbers" },
                { value: "Internet Installers", icon: "📡", label: "Internet" },
                { value: "Security", icon: "🛡️", label: "Security" },
                { value: "Painters", icon: "🎨", label: "Painters" },
                { value: "Fumigators", icon: "🪲", label: "Fumigators" },
                { value: "Carpenters", icon: "🪚", label: "Carpenters" },
                { value: "Gardeners", icon: "🌿", label: "Gardeners" },
                { value: "AC Repair", icon: "❄️", label: "AC Repair" },
                { value: "Locksmiths", icon: "🔑", label: "Locksmiths" },
                { value: "Welders", icon: "🔥", label: "Welders" },
                { value: "Masons", icon: "🧱", label: "Masons" },
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setServiceCategory(cat.value)}
                  className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-center transition-all duration-200 ${
                    serviceCategory === cat.value
                      ? "bg-primary/15 ring-1 ring-primary/30 scale-105"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className={`text-[10px] font-semibold leading-none ${
                    serviceCategory === cat.value ? "text-primary" : "text-muted-foreground"
                  }`}>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-medium">Sort:</span>
              {([
                { value: "featured", label: "Featured" },
                { value: "rating", label: "Top Rated" },
                { value: "reviews", label: "Most Reviews" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setServiceSort(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    serviceSort === opt.value
                      ? "gradient-trust text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {opt.label}
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
                        {recentMap.get(p.id) && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatRelativeTime(recentMap.get(p.id)!)}
                          </p>
                        )}
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
              {loadingSegment ? (
                Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              ) : (
                filteredProperties.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    onPress={handleSelectProperty}
                    liked={isFavorite(p.id)}
                    onToggleLike={toggleFavorite}
                    compareMode={compareIds.length > 0}
                    isComparing={compareIds.includes(p.id)}
                    onToggleCompare={(id) => setCompareIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 3))}
                  />
                ))
              )}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-secondary flex items-center justify-center">
                  <SearchX className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">No matches found</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Try broadening your search or clearing filters</p>
                <div className="flex flex-col gap-2 max-w-[240px] mx-auto">
                  <button
                    onClick={() => {
                      setCounty(""); setSubcounty(""); setWard(""); setEstate("");
                      setSearchQuery("");
                      setFilters({
                        minPrice: 0, maxPrice: 500000, bedrooms: [], amenities: [],
                        verified: false, smileIdVerified: false, furnished: false, petFriendly: false,
                        sortBy: "featured", commercialTypes: [], minSqft: 0, maxSqft: 100000,
                      });
                      setCommCategory("All");
                    }}
                    className="w-full py-2.5 rounded-xl gradient-trust text-xs font-semibold text-primary-foreground"
                  >
                    Clear all filters
                  </button>
                  {(county || estate || searchQuery) && (
                    <button
                      onClick={handleSaveSearch}
                      className="w-full py-2.5 rounded-xl bg-secondary text-xs font-semibold text-secondary-foreground flex items-center justify-center gap-1.5"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      Notify me when available
                    </button>
                  )}
                </div>
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
    </PullToRefresh>
  );
};

export default HomeFeed;

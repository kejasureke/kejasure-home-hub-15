import { Search, Bell, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import LocationSelector from "./LocationSelector";
import PropertyCard from "./PropertyCard";
import ServiceCard from "./ServiceCard";
import ListingDetail from "./ListingDetail";
import { properties, serviceProviders } from "@/data/mockData";

const segments = ["Rentals", "Short Stays", "Services"] as const;

const HomeFeed = () => {
  const [segment, setSegment] = useState<(typeof segments)[number]>("Rentals");
  const [county, setCounty] = useState("");
  const [estate, setEstate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const filteredProperties = properties.filter((p) => {
    const matchType = segment === "Rentals" ? p.type === "rental" : p.type === "shortstay";
    const matchCounty = !county || p.county === county;
    const matchEstate = !estate || p.estate === estate;
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.estate.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchCounty && matchEstate && matchSearch;
  });

  const property = selectedProperty ? properties.find((p) => p.id === selectedProperty) : null;

  if (property) {
    return <ListingDetail property={property} onBack={() => setSelectedProperty(null)} />;
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="gradient-trust px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">KejaSure</h1>
            <p className="text-xs text-primary-foreground/70">Pata Keja, Be Sure.</p>
          </div>
          <button className="relative w-10 h-10 rounded-full bg-primary-foreground/15 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-foreground" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
          </button>
        </div>

        {/* Location + Search */}
        <div className="flex items-center gap-2 mb-4">
          <LocationSelector
            selectedCounty={county}
            selectedEstate={estate}
            onSelect={(c, e) => { setCounty(c); setEstate(e); }}
          />
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search estates, landmarks, features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 rounded-xl bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 card-shadow"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-secondary">
            <SlidersHorizontal className="w-4 h-4 text-foreground" />
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
            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {["All", "Movers", "Cleaners", "Electricians", "Plumbers", "Internet", "Security"].map((cat) => (
                <button key={cat} className="shrink-0 px-3.5 py-2 rounded-full bg-secondary text-xs font-medium text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                  {cat}
                </button>
              ))}
            </div>
            {serviceProviders.map((sp) => (
              <ServiceCard key={sp.id} provider={sp} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Featured section */}
            {filteredProperties.some((p) => p.featured) && (
              <div>
                <h2 className="text-base font-semibold mb-3">
                  {segment === "Short Stays" ? "⭐ Top-Rated Stays" : "⭐ Featured Properties"}
                </h2>
                {filteredProperties
                  .filter((p) => p.featured)
                  .map((p) => (
                    <PropertyCard key={p.id} property={p} onPress={setSelectedProperty} />
                  ))}
              </div>
            )}

            <h2 className="text-base font-semibold">
              {segment === "Short Stays" ? "All Short Stays" : "All Rentals"}
            </h2>
            <div className="space-y-4">
              {filteredProperties.map((p) => (
                <PropertyCard key={p.id} property={p} onPress={setSelectedProperty} />
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
    </div>
  );
};

export default HomeFeed;

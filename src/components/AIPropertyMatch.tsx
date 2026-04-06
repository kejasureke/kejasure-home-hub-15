import { ArrowLeft, Sparkles, Send, MapPin, Star, Bed, Bath, TrendingUp, Lightbulb, Package } from "lucide-react";
import { useState } from "react";
import { properties, serviceProviders } from "@/data/mockData";
import type { Property } from "@/data/mockData";

interface Props {
  onBack: () => void;
  onSelectProperty: (id: string) => void;
}

interface MatchResult {
  property: Property;
  confidence: number;
  reasons: string[];
}

interface Recommendation {
  type: "estate" | "service" | "tip";
  title: string;
  description: string;
  icon: any;
}

const parseQuery = (query: string) => {
  const q = query.toLowerCase();

  const bedroomMatch = q.match(/(\d)\s*(?:bed|br|bedroom)/);
  const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : null;

  const priceMatch = q.match(/(?:under|below|less than|max|budget)\s*(?:kes\s*)?(\d+)k?/i);
  let maxPrice = priceMatch ? parseInt(priceMatch[1]) : null;
  if (maxPrice && maxPrice < 1000) maxPrice *= 1000;

  const minPriceMatch = q.match(/(?:above|over|more than|min|from)\s*(?:kes\s*)?(\d+)k?/i);
  let minPrice = minPriceMatch ? parseInt(minPriceMatch[1]) : null;
  if (minPrice && minPrice < 1000) minPrice *= 1000;

  const locationWords = ["kilimani", "westlands", "karen", "south b", "nyali", "roysambu", "gigiri", "upper hill", "diani", "mombasa", "nairobi"];
  const location = locationWords.find(l => q.includes(l)) || null;

  const wantsFurnished = q.includes("furnished");
  const wantsPets = q.includes("pet") || q.includes("dog") || q.includes("cat");
  const wantsParking = q.includes("parking");
  const wantsPool = q.includes("pool") || q.includes("swimming");
  const wantsGym = q.includes("gym");
  const wantsCorporate = q.includes("corporate") || q.includes("expat") || q.includes("serviced");

  const isShortStay = q.includes("night") || q.includes("stay") || q.includes("airbnb") || q.includes("short");

  const amenityKeywords: string[] = [];
  if (wantsParking) amenityKeywords.push("Parking");
  if (wantsPool) amenityKeywords.push("Swimming Pool");
  if (wantsGym) amenityKeywords.push("Gym");

  return { bedrooms, maxPrice, minPrice, location, wantsFurnished, wantsPets, amenityKeywords, isShortStay, wantsCorporate };
};

const matchProperties = (query: string): { matches: MatchResult[]; recommendations: Recommendation[] } => {
  const parsed = parseQuery(query);
  const scored: MatchResult[] = [];

  for (const p of properties) {
    let score = 50;
    const reasons: string[] = [];

    // Type match
    if (parsed.isShortStay && p.type === "shortstay") { score += 15; reasons.push("Short stay match"); }
    else if (!parsed.isShortStay && p.type === "rental") { score += 10; }

    // Bedrooms
    if (parsed.bedrooms !== null) {
      if (p.bedrooms === parsed.bedrooms) { score += 20; reasons.push(`${parsed.bedrooms} bedroom match`); }
      else if (Math.abs(p.bedrooms - parsed.bedrooms) === 1) { score += 5; reasons.push("Close bedroom count"); }
      else score -= 10;
    }

    // Price
    if (parsed.maxPrice !== null) {
      if (p.price <= parsed.maxPrice) { score += 20; reasons.push(`Within budget (KES ${new Intl.NumberFormat("en-KE").format(parsed.maxPrice)})`); }
      else if (p.price <= parsed.maxPrice * 1.15) { score += 5; reasons.push("Slightly above budget"); }
      else score -= 15;
    }
    if (parsed.minPrice !== null && p.price >= parsed.minPrice) {
      score += 5;
    }

    // Location
    if (parsed.location) {
      const loc = parsed.location.toLowerCase();
      if (p.estate.toLowerCase().includes(loc) || p.county.toLowerCase().includes(loc)) {
        score += 25; reasons.push(`Located in ${p.estate}`);
      }
    }

    // Amenities
    for (const a of parsed.amenityKeywords) {
      if (p.amenities.includes(a)) { score += 5; reasons.push(`Has ${a}`); }
    }

    // Furnished
    if (parsed.wantsFurnished && p.furnished) { score += 10; reasons.push("Furnished"); }

    // Pets
    if (parsed.wantsPets && p.petFriendly) { score += 10; reasons.push("Pet friendly 🐾"); }

    // Corporate
    if (parsed.wantsCorporate && p.corporate) { score += 15; reasons.push("Corporate/Expat housing"); }

    // Verified bonus
    if (p.verified) { score += 5; reasons.push("Verified listing"); }

    // Rating bonus
    if (p.rating && p.rating >= 4.5) { score += 5; reasons.push(`Highly rated (${p.rating}★)`); }

    const confidence = Math.min(98, Math.max(15, score));
    if (confidence > 30) {
      scored.push({ property: p, confidence, reasons });
    }
  }

  scored.sort((a, b) => b.confidence - a.confidence);

  // Recommendations
  const recommendations: Recommendation[] = [];
  if (scored.length > 0) {
    const topEstate = scored[0].property.estate;
    const nearby = properties.filter(p => p.estate !== topEstate && p.county === scored[0].property.county && !scored.find(s => s.property.id === p.id));
    if (nearby.length > 0) {
      recommendations.push({
        type: "estate",
        title: `Also consider ${nearby[0].estate}`,
        description: `Similar area with ${nearby.length} more listing${nearby.length > 1 ? "s" : ""} nearby`,
        icon: MapPin,
      });
    }
  }

  const relevantServices = serviceProviders.filter(s => s.category === "Movers" || s.category === "Cleaners").slice(0, 2);
  if (relevantServices.length > 0) {
    recommendations.push({
      type: "service",
      title: "Move-in services available",
      description: `${relevantServices.map(s => s.name).join(", ")} ready to help`,
      icon: Package,
    });
  }

  recommendations.push({
    type: "tip",
    title: "Pro tip",
    description: "Try being more specific — mention amenities, budget, or location for better matches",
    icon: Lightbulb,
  });

  return { matches: scored.slice(0, 6), recommendations };
};

const suggestedQueries = [
  "Need a 1 bedroom in Nyali under 20k with parking",
  "Furnished 2BR in Kilimani with gym and pool",
  "Corporate serviced apartment in Gigiri",
  "Short stay in Diani near the beach under 15k/night",
  "Affordable bedsitter near TRM under 15k",
  "Pet-friendly 2 bedroom in Karen",
];

const AIPropertyMatch = ({ onBack, onSelectProperty }: Props) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ matches: MatchResult[]; recommendations: Recommendation[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsSearching(true);
    setSearchHistory(prev => [q, ...prev.filter(h => h !== q)].slice(0, 5));

    // Simulate AI thinking time
    setTimeout(() => {
      const result = matchProperties(q);
      setResults(result);
      setIsSearching(false);
    }, 800);
  };

  const formatPrice = (n: number) => new Intl.NumberFormat("en-KE").format(n);

  return (
    <div className="fixed inset-0 z-40 bg-background overflow-y-auto animate-slide-up">
      <div className="px-4 pt-5 pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Keja AI Match
            </h1>
            <p className="text-xs text-muted-foreground">Describe your dream home in plain language</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
            placeholder='Try: "Need a 2BR in Westlands with parking under 60k"'
            className="w-full p-4 pr-12 rounded-2xl bg-card card-shadow text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[60px]"
            rows={2}
          />
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isSearching}
            className="absolute right-3 bottom-3 w-9 h-9 rounded-xl gradient-trust flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>

        {/* Suggested queries */}
        {!results && !isSearching && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Try these:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.map(sq => (
                <button
                  key={sq}
                  onClick={() => { setQuery(sq); handleSearch(sq); }}
                  className="px-3 py-2 rounded-xl bg-secondary text-[11px] text-foreground active:scale-95 transition-transform text-left"
                >
                  "{sq}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="w-12 h-12 rounded-full gradient-trust flex items-center justify-center mb-4 animate-pulse">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <p className="text-sm font-semibold">Keja AI is matching...</p>
            <p className="text-xs text-muted-foreground mt-1">Analyzing listings, location, and amenities</p>
          </div>
        )}

        {/* Results */}
        {results && !isSearching && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {results.matches.length} Match{results.matches.length !== 1 ? "es" : ""} Found
              </h2>
              <button onClick={() => { setResults(null); setQuery(""); }} className="text-xs text-primary font-medium">
                New Search
              </button>
            </div>

            {results.matches.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">No strong matches found. Try different criteria.</p>
              </div>
            )}

            {results.matches.map((match, i) => (
              <button
                key={match.property.id}
                onClick={() => onSelectProperty(match.property.id)}
                className="w-full text-left rounded-2xl bg-card card-shadow overflow-hidden active:scale-[0.98] transition-transform"
              >
                <div className="relative">
                  <img src={match.property.image} alt={match.property.title} className="w-full aspect-[16/9] object-cover" />
                  {/* Confidence badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary/90 text-[10px] font-bold text-primary-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {match.confidence}% match
                  </div>
                  {i === 0 && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-accent/90 text-[10px] font-bold text-accent-foreground">
                      🏆 Best Match
                    </div>
                  )}
                </div>
                <div className="p-3.5">
                  <h3 className="text-sm font-semibold mb-1">{match.property.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <MapPin className="w-3 h-3" />
                    {match.property.estate}, {match.property.county}
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-primary">KES {formatPrice(match.property.price)}{match.property.priceUnit}</span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Bed className="w-3 h-3" /> {match.property.bedrooms}
                      <Bath className="w-3 h-3 ml-1" /> {match.property.bathrooms}
                    </div>
                    {match.property.rating && (
                      <div className="flex items-center gap-0.5 ml-auto">
                        <Star className="w-3 h-3 fill-gold text-gold" />
                        <span className="text-xs font-semibold">{match.property.rating}</span>
                      </div>
                    )}
                  </div>
                  {/* Match reasons */}
                  <div className="flex flex-wrap gap-1.5">
                    {match.reasons.slice(0, 4).map((r, j) => (
                      <span key={j} className="px-2 py-0.5 rounded-full bg-primary/5 text-[10px] font-medium text-primary">
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}

            {/* Recommendations */}
            {results.recommendations.length > 0 && (
              <div className="pt-2">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {results.recommendations.map((rec, i) => (
                    <div key={i} className="p-3 rounded-xl bg-secondary flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <rec.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{rec.title}</p>
                        <p className="text-[10px] text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIPropertyMatch;

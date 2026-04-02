import { MapPin, ChevronDown, Search, X } from "lucide-react";
import { useState } from "react";
import { kenyaCounties } from "@/data/kenyaCounties";

interface LocationSelectorProps {
  selectedCounty: string;
  selectedEstate: string;
  onSelect: (county: string, estate: string) => void;
}

const LocationSelector = ({ selectedCounty, selectedEstate, onSelect }: LocationSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<"county" | "estate">("county");
  const [tempCounty, setTempCounty] = useState("");

  const filteredCounties = kenyaCounties.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountyData = kenyaCounties.find((c) => c.name === tempCounty);
  const filteredEstates = selectedCountyData?.estates.filter((e) =>
    e.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleCountySelect = (county: string) => {
    setTempCounty(county);
    setStep("estate");
    setSearch("");
  };

  const handleEstateSelect = (estate: string) => {
    onSelect(tempCounty, estate);
    setIsOpen(false);
    setStep("county");
    setSearch("");
  };

  const displayText = selectedEstate
    ? `${selectedEstate}, ${selectedCounty}`
    : selectedCounty || "All Kenya";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card card-shadow text-sm font-medium text-foreground transition-all active:scale-[0.98]"
      >
        <MapPin className="w-4 h-4 text-primary" />
        <span className="truncate max-w-[180px]">{displayText}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background animate-slide-up">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <button onClick={() => {
              if (step === "estate") { setStep("county"); setSearch(""); }
              else { setIsOpen(false); setStep("county"); setSearch(""); }
            }}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-lg font-semibold">
              {step === "county" ? "Select County" : `Estates in ${tempCounty}`}
            </h2>
          </div>

          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={step === "county" ? "Search counties..." : "Search estates..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
          </div>

          {step === "county" && (
            <div className="px-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
              <button
                onClick={() => { onSelect("", ""); setIsOpen(false); setStep("county"); }}
                className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors mb-1"
              >
                📍 All Kenya
              </button>
              {filteredCounties.map((county) => (
                <button
                  key={county.name}
                  onClick={() => handleCountySelect(county.name)}
                  className="w-full text-left px-4 py-3.5 rounded-xl text-sm hover:bg-secondary transition-colors flex items-center justify-between"
                >
                  <span>{county.name}</span>
                  <span className="text-xs text-muted-foreground">{county.estates.length} areas</span>
                </button>
              ))}
            </div>
          )}

          {step === "estate" && (
            <div className="px-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
              <button
                onClick={() => { onSelect(tempCounty, ""); setIsOpen(false); setStep("county"); }}
                className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors mb-1"
              >
                All {tempCounty}
              </button>
              {filteredEstates.map((estate) => (
                <button
                  key={estate}
                  onClick={() => handleEstateSelect(estate)}
                  className="w-full text-left px-4 py-3.5 rounded-xl text-sm hover:bg-secondary transition-colors"
                >
                  {estate}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default LocationSelector;

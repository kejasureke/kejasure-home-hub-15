import { MapPin, ChevronDown, Search, X, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { kenyaLocations, landmarks } from "@/data/kenyaLocations";

interface LocationSelectorProps {
  selectedCounty: string;
  selectedSubcounty: string;
  selectedWard: string;
  selectedEstate: string;
  onSelect: (county: string, subcounty: string, ward: string, estate: string) => void;
}

type Step = "county" | "subcounty" | "ward" | "estate" | "landmark";

const LocationSelector = ({ selectedCounty, selectedSubcounty, selectedWard, selectedEstate, onSelect }: LocationSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<Step>("county");
  const [tempCounty, setTempCounty] = useState("");
  const [tempSubcounty, setTempSubcounty] = useState("");
  const [tempWard, setTempWard] = useState("");

  const countyData = kenyaLocations.find((c) => c.name === tempCounty);
  const subcountyData = countyData?.subcounties.find((s) => s.name === tempSubcounty);
  const wardData = subcountyData?.wards.find((w) => w.name === tempWard);

  const filteredCounties = kenyaLocations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubcounties = countyData?.subcounties.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredWards = subcountyData?.wards.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredEstates = (() => {
    if (wardData) return wardData.estates.filter((e) => e.toLowerCase().includes(search.toLowerCase()));
    if (countyData) return countyData.estates.filter((e) => e.toLowerCase().includes(search.toLowerCase()));
    return [];
  })();

  const filteredLandmarks = landmarks.filter((l) =>
    l.toLowerCase().includes(search.toLowerCase())
  );

  const handleCountySelect = (county: string) => {
    setTempCounty(county);
    const cd = kenyaLocations.find((c) => c.name === county);
    if (cd && cd.subcounties.length > 0) {
      setStep("subcounty");
    } else {
      setStep("estate");
    }
    setSearch("");
  };

  const handleSubcountySelect = (subcounty: string) => {
    setTempSubcounty(subcounty);
    setStep("ward");
    setSearch("");
  };

  const handleWardSelect = (ward: string) => {
    setTempWard(ward);
    setStep("estate");
    setSearch("");
  };

  const handleEstateSelect = (estate: string) => {
    onSelect(tempCounty, tempSubcounty, tempWard, estate);
    close();
  };

  const close = () => {
    setIsOpen(false);
    setStep("county");
    setSearch("");
    setTempCounty("");
    setTempSubcounty("");
    setTempWard("");
  };

  const goBack = () => {
    if (step === "estate" && tempWard) { setStep("ward"); setTempWard(""); }
    else if (step === "estate") { setStep(tempSubcounty ? "subcounty" : "county"); }
    else if (step === "ward") { setStep("subcounty"); setTempSubcounty(""); }
    else if (step === "subcounty") { setStep("county"); setTempCounty(""); }
    else if (step === "landmark") { setStep("county"); }
    else close();
    setSearch("");
  };

  const displayText = selectedEstate
    ? `${selectedEstate}, ${selectedCounty}`
    : selectedWard
    ? `${selectedWard}, ${selectedCounty}`
    : selectedSubcounty
    ? `${selectedSubcounty}, ${selectedCounty}`
    : selectedCounty || "All Kenya";

  const stepTitle = step === "county" ? "Select County" :
    step === "subcounty" ? `Sub-counties in ${tempCounty}` :
    step === "ward" ? `Wards in ${tempSubcounty}` :
    step === "estate" ? `Estates in ${tempWard || tempSubcounty || tempCounty}` :
    "Search Landmarks";

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
            <button onClick={goBack}>
              {step === "county" ? <X className="w-5 h-5 text-muted-foreground" /> : <ArrowLeft className="w-5 h-5 text-muted-foreground" />}
            </button>
            <h2 className="text-base font-semibold flex-1">{stepTitle}</h2>
            {step === "county" && (
              <button onClick={() => setStep("landmark")} className="text-xs font-medium text-primary">
                🏢 Landmarks
              </button>
            )}
          </div>

          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={
                  step === "county" ? "Search 47 counties..." :
                  step === "subcounty" ? "Search sub-counties..." :
                  step === "ward" ? "Search wards..." :
                  step === "landmark" ? "Search landmarks..." :
                  "Search estates..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
          </div>

          <div className="px-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
            {step === "county" && (
              <>
                <button
                  onClick={() => { onSelect("", "", "", ""); close(); }}
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
                    <span className="text-xs text-muted-foreground">
                      {county.subcounties.length > 0 ? `${county.subcounties.length} sub-counties` : `${county.estates.length} areas`}
                    </span>
                  </button>
                ))}
              </>
            )}

            {step === "subcounty" && (
              <>
                <button
                  onClick={() => { onSelect(tempCounty, "", "", ""); close(); }}
                  className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors mb-1"
                >
                  All {tempCounty}
                </button>
                {filteredSubcounties.map((sc) => (
                  <button
                    key={sc.name}
                    onClick={() => handleSubcountySelect(sc.name)}
                    className="w-full text-left px-4 py-3.5 rounded-xl text-sm hover:bg-secondary transition-colors flex items-center justify-between"
                  >
                    <span>{sc.name}</span>
                    <span className="text-xs text-muted-foreground">{sc.wards.length} wards</span>
                  </button>
                ))}
              </>
            )}

            {step === "ward" && (
              <>
                <button
                  onClick={() => { onSelect(tempCounty, tempSubcounty, "", ""); close(); }}
                  className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors mb-1"
                >
                  All {tempSubcounty}
                </button>
                {filteredWards.map((ward) => (
                  <button
                    key={ward.name}
                    onClick={() => handleWardSelect(ward.name)}
                    className="w-full text-left px-4 py-3.5 rounded-xl text-sm hover:bg-secondary transition-colors flex items-center justify-between"
                  >
                    <span>{ward.name}</span>
                    <span className="text-xs text-muted-foreground">{ward.estates.length} estates</span>
                  </button>
                ))}
              </>
            )}

            {step === "estate" && (
              <>
                <button
                  onClick={() => { onSelect(tempCounty, tempSubcounty, tempWard, ""); close(); }}
                  className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-colors mb-1"
                >
                  All Areas
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
              </>
            )}

            {step === "landmark" && (
              <>
                <p className="text-xs text-muted-foreground mb-3 px-1">Find properties near popular landmarks</p>
                {filteredLandmarks.map((l) => (
                  <button
                    key={l}
                    onClick={() => { close(); }}
                    className="w-full text-left px-4 py-3.5 rounded-xl text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {l}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LocationSelector;

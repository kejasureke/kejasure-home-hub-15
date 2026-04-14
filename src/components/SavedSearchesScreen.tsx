import { ArrowLeft, Search, Bell, BellOff, Trash2, MapPin, Clock, Plus, Filter } from "lucide-react";
import { useState } from "react";
import { useSavedSearches, type SavedSearch } from "@/hooks/useSavedSearches";

interface SavedSearchesScreenProps {
  onBack: () => void;
  onRunSearch?: (search: SavedSearch) => void;
}


const SavedSearchesScreen = ({ onBack, onRunSearch }: SavedSearchesScreenProps) => {
  const { searches, removeSearch, saveSearch } = useSavedSearches();
  const [alertsEnabled, setAlertsEnabled] = useState<Record<string, boolean>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCounty, setNewCounty] = useState("");
  const [newSegment, setNewSegment] = useState("rental");

  const toggleAlert = (id: string) => {
    setAlertsEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSearch = () => {
    if (!newLabel.trim() || !newCounty.trim()) return;
    saveSearch({ label: newLabel, county: newCounty, subcounty: "", estate: "", segment: newSegment });
    setNewLabel("");
    setNewCounty("");
    setShowAdd(false);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
  };

  // Demo data if no saved searches
  const demoSearches: SavedSearch[] = searches.length > 0 ? searches : [
    { id: "demo1", label: "2BR in Kilimani", county: "Nairobi", subcounty: "Dagoretti North", estate: "Kilimani", segment: "rental", createdAt: Date.now() - 86400000 * 3 },
    { id: "demo2", label: "Studio in Westlands", county: "Nairobi", subcounty: "Westlands", estate: "Westlands", segment: "rental", createdAt: Date.now() - 86400000 },
    { id: "demo3", label: "Airbnb in Diani", county: "Kwale", subcounty: "Msambweni", estate: "Diani Beach", segment: "shortstay", createdAt: Date.now() - 86400000 * 7 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="sticky top-0 z-10 glass-surface border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold">Saved Searches</h1>
          <p className="text-[10px] text-muted-foreground">{demoSearches.length} saved searches</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="w-9 h-9 rounded-full gradient-trust flex items-center justify-center">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

      <div className="px-4 py-5 pb-20">
        {demoSearches.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold mb-1">No Saved Searches</h3>
            <p className="text-sm text-muted-foreground text-center max-w-[260px] mb-4">
              Save your search criteria to get instant alerts when new listings match.
            </p>
            <button onClick={() => setShowAdd(true)} className="px-6 py-3 rounded-xl gradient-trust text-sm font-bold text-primary-foreground">
              Create First Search
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {demoSearches.map((s) => (
              <div
                key={s.id}
                className="bg-card rounded-2xl card-shadow p-4 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => onRunSearch?.(s)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate">{s.label}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{s.estate ? `${s.estate}, ` : ""}{s.county}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        s.segment === "shortstay" ? "bg-accent/15 text-accent-foreground" : "bg-primary/10 text-primary"
                      }`}>
                        {s.segment === "shortstay" ? "Short Stay" : s.segment === "service" ? "Service" : "Rental"}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(s.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => toggleAlert(s.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      alertsEnabled[s.id] ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {alertsEnabled[s.id] ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                    {alertsEnabled[s.id] ? "Alerts On" : "Alerts Off"}
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary text-xs font-semibold text-muted-foreground">
                    <Filter className="w-3.5 h-3.5" />
                    Edit Filters
                  </button>
                  <button
                    onClick={() => removeSearch(s.id)}
                    className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Search Sheet */}
      {showAdd && (
        <div className="fixed inset-0 z-[60] flex items-end bg-foreground/40 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="w-full bg-card rounded-t-3xl p-5 pb-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-4">New Saved Search</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Search Name</label>
                <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. 2BR in Kilimani" className="w-full p-3 rounded-xl bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">County</label>
                <input value={newCounty} onChange={(e) => setNewCounty(e.target.value)} placeholder="e.g. Nairobi" className="w-full p-3 rounded-xl bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block">Segment</label>
                <div className="flex gap-2">
                  {[{ v: "rental", l: "Rental" }, { v: "shortstay", l: "Short Stay" }, { v: "service", l: "Service" }].map((s) => (
                    <button key={s.v} onClick={() => setNewSegment(s.v)} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors ${newSegment === s.v ? "gradient-trust text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAddSearch} disabled={!newLabel.trim() || !newCounty.trim()} className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-all disabled:opacity-40 mt-2">
                Save Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSearchesScreen;
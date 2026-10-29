import { ArrowLeft, BellRing, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import { useHardwareBack } from "@/hooks/useHardwareBack";
import { haptic } from "@/lib/despia";
import { kenyaCounties } from "@/data/kenyaCounties";
import { ALERTS_EVENT, addAlert, describeAlert, readAlerts, removeAlert, syncAlerts, type ListingAlert } from "@/lib/listingAlerts";

const BUDGETS = [0, 10000, 15000, 20000, 30000, 50000, 80000, 120000];
const SEGMENTS: { v: ListingAlert["segment"]; l: string }[] = [
  { v: "rental", l: "Rentals" }, { v: "shortstay", l: "Short stays" }, { v: "commercial", l: "Business" }, { v: "any", l: "Any" },
];

const ListingAlertsScreen = ({ onBack }: { onBack: () => void }) => {
  const { closing, triggerClose } = useOverlayClose(onBack);
  useHardwareBack(true, triggerClose);
  const [alerts, setAlerts] = useState(readAlerts);
  const [adding, setAdding] = useState(false);
  const [segment, setSegment] = useState<ListingAlert["segment"]>("rental");
  const [county, setCounty] = useState("");
  const [estate, setEstate] = useState("");
  const [bedrooms, setBedrooms] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);

  useEffect(() => {
    const s = () => setAlerts(readAlerts());
    window.addEventListener(ALERTS_EVENT, s);
    syncAlerts();
    return () => window.removeEventListener(ALERTS_EVENT, s);
  }, []);

  const save = () => {
    addAlert({ segment, county, estate: estate.trim(), bedrooms, maxPrice });
    haptic("success");
    setAdding(false);
  };

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`;

  return (
    <div className={`fixed inset-0 z-[60] bg-background overflow-y-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}>
      <div className="sticky top-0 z-10 glass-surface border-b border-border px-4 pb-3 pt-safe-compact flex items-center gap-3">
        <button onClick={triggerClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold">New listing alerts</h1>
          <p className="text-[10px] text-muted-foreground">Get told the minute a match is listed</p>
        </div>
        <button onClick={() => setAdding(true)} className="w-9 h-9 rounded-full gradient-trust flex items-center justify-center" aria-label="New alert">
          <Plus className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>

      <div className="px-4 py-5 pb-32 space-y-3">
        {adding && (
          <div className="p-4 rounded-2xl bg-card border border-border space-y-4">
            <div>
              <p className="text-xs font-semibold mb-2">Type</p>
              <div className="flex flex-wrap gap-2">
                {SEGMENTS.map((s) => <button key={s.v} onClick={() => setSegment(s.v)} className={chip(segment === s.v)}>{s.l}</button>)}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2">County</p>
              <select value={county} onChange={(e) => setCounty(e.target.value)} className="w-full h-11 px-3 rounded-xl bg-secondary text-sm">
                <option value="">Anywhere in Kenya</option>
                {kenyaCounties.map((c: any) => <option key={c.name ?? c} value={c.name ?? c}>{c.name ?? c}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2">Estate (optional)</p>
              <input value={estate} onChange={(e) => setEstate(e.target.value)} placeholder="e.g. Kilimani" className="w-full h-11 px-3 rounded-xl bg-secondary text-sm" />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2">Bedrooms</p>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((b) => <button key={b} onClick={() => setBedrooms(b)} className={chip(bedrooms === b)}>{b === 0 ? "Any" : b === 4 ? "4+" : b}</button>)}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2">Max price</p>
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((p) => <button key={p} onClick={() => setMaxPrice(p)} className={chip(maxPrice === p)}>{p === 0 ? "No limit" : `KES ${p / 1000}K`}</button>)}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              You'll get: <span className="font-semibold text-foreground">{describeAlert({ id: "", createdAt: 0, segment, county, estate, bedrooms, maxPrice })}</span>
            </p>
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="flex-1 h-11 rounded-xl bg-secondary text-sm font-semibold">Cancel</button>
              <button onClick={save} className="flex-1 h-11 rounded-xl gradient-trust text-sm font-bold text-primary-foreground">Save alert</button>
            </div>
          </div>
        )}

        {alerts.length === 0 && !adding && (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <BellRing className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm font-semibold mb-1">No alerts yet</p>
            <p className="text-xs text-muted-foreground px-6 mb-4">Tell us what you want, like "1-bedroom under 20K in Kilimani", and be first to know.</p>
            <button onClick={() => setAdding(true)} className="px-5 h-11 rounded-xl gradient-trust text-sm font-bold text-primary-foreground">Create alert</button>
          </div>
        )}

        {alerts.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
            <BellRing className="w-5 h-5 text-primary shrink-0" />
            <p className="flex-1 text-sm font-semibold">{describeAlert(a)}</p>
            <button onClick={() => { haptic("light"); removeAlert(a.id); }} className="p-2 text-muted-foreground" aria-label="Delete alert">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingAlertsScreen;

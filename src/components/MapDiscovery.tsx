import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Navigation, Crosshair, CircleOff, MapPin, Settings as SettingsIcon, AlertTriangle } from "lucide-react";
import { properties, serviceProviders } from "@/data/mockData";
import { useMapPan } from "@/hooks/useMapPan";
import MapPins, { type Pin, type PinType } from "./map/MapPins";
import SelectedCard from "./map/SelectedCard";
import ZoomControls from "./map/ZoomControls";
import { getCurrentLocation, haptic, isDespia, openNativeSettings } from "@/lib/despia";
import { useToast } from "@/hooks/use-toast";

const LOCATION_KEY = "kejasure_location_enabled";
const AUTO_RECENTER_KEY = "kejasure_map_auto_recenter";

const formatAgo = (ts: number) => {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
};

interface MapDiscoveryProps {
  onBack: () => void;
  onSelectProperty: (id: string) => void;
}

// Nairobi center
const CENTER = { lat: -1.2864, lng: 36.8172 };
const MAP_W = 390;
const MAP_H = 420;

const MapDiscovery = ({ onBack, onSelectProperty }: MapDiscoveryProps) => {
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "rentals" | "shortstays" | "services">("all");
  const [showHereTooltip, setShowHereTooltip] = useState(false);
  const [gpsFix, setGpsFix] = useState<{ accuracy: number; ts: number } | null>(null);
  const [locError, setLocError] = useState<null | "off" | "denied" | "unavailable" | "timeout">(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [, forceTick] = useState(0);
  const [locationEnabled, setLocationEnabled] = useState(() => {
    try { return localStorage.getItem(LOCATION_KEY) === "true"; } catch { return false; }
  });
  const [autoRecenter, setAutoRecenter] = useState(() => {
    try { return localStorage.getItem(AUTO_RECENTER_KEY) === "true"; } catch { return false; }
  });

  // Live compass heading (device orientation). Uses webkitCompassHeading on
  // iOS/Despia when available, otherwise falls back to `alpha`.
  useEffect(() => {
    if (!locationEnabled) return;
    const onOrient = (e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      const h = typeof e.webkitCompassHeading === "number"
        ? e.webkitCompassHeading
        : e.alpha != null ? 360 - e.alpha : null;
      if (h != null && !Number.isNaN(h)) setHeading(h);
    };
    window.addEventListener("deviceorientation", onOrient, true);
    return () => window.removeEventListener("deviceorientation", onOrient, true);
  }, [locationEnabled]);

  useEffect(() => {
    if (!showHereTooltip) return;
    const t = setTimeout(() => setShowHereTooltip(false), 1800);
    return () => clearTimeout(t);
  }, [showHereTooltip]);

  // Refresh "last updated" label every 15s while a fix exists.
  useEffect(() => {
    if (!gpsFix) return;
    const t = setInterval(() => forceTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, [gpsFix]);

  const { toast } = useToast();

  const {
    zoom,
    pan,
    minZoom,
    maxZoom,
    zoomIn,
    zoomOut,
    recenter,
    isCentered,
    project,
    touchHandlers,
  } = useMapPan(CENTER, MAP_W, MAP_H);

  const fetchFix = useCallback(async (opts: { silent?: boolean } = {}) => {
    if (!locationEnabled) {
      setLocError("off");
      return null;
    }
    try {
      const fix = await getCurrentLocation();
      setGpsFix({ accuracy: fix.accuracy ?? 0, ts: Date.now() });
      setLocError(null);
      if (!opts.silent) haptic("light");
      return fix;
    } catch (err: any) {
      const msg = String(err?.message || "").toLowerCase();
      const kind: "denied" | "timeout" | "unavailable" =
        /denied|permission/.test(msg) ? "denied"
        : /timeout|timed out/.test(msg) ? "timeout"
        : "unavailable";
      setLocError(kind);
      if (!opts.silent && kind === "timeout") {
        toast({ title: "GPS timed out", description: "Try again with a clearer view of the sky." });
      }
      return null;
    }
  }, [locationEnabled, toast]);

  const enableInAppLocation = () => {
    try { localStorage.setItem(LOCATION_KEY, "true"); } catch {}
    setLocationEnabled(true);
    haptic("light");
    // Immediately attempt a fix so the user sees progress.
    fetchFix({ silent: true });
  };

  const handleOpenSettings = () => {
    haptic("light");
    if (isDespia()) {
      openNativeSettings();
      toast({
        title: "Opening device settings",
        description: "Enable Location for KejaSure, then return to the app.",
      });
    } else {
      toast({
        title: "Open your device settings",
        description: "Go to Settings › Apps › KejaSure › Permissions › Location and allow access.",
      });
    }
  };

  const handleRecenter = async () => {
    recenter();
    setShowHereTooltip(true);
    const fix = await fetchFix();
    if (fix) {
      toast({
        title: "Location updated",
        description: `Centered on your position (±${Math.round(fix.accuracy ?? 0)}m).`,
      });
    }
  };

  // Auto-recenter: poll GPS every 20s and softly recenter map.
  const autoTimer = useRef<number | null>(null);
  useEffect(() => {
    if (autoTimer.current) { clearInterval(autoTimer.current); autoTimer.current = null; }
    if (!autoRecenter || !locationEnabled) return;
    // Kick off immediately, then interval.
    fetchFix({ silent: true }).then((f) => { if (f) recenter(); });
    autoTimer.current = window.setInterval(() => {
      fetchFix({ silent: true }).then((f) => { if (f) recenter(); });
    }, 20000);
    return () => {
      if (autoTimer.current) { clearInterval(autoTimer.current); autoTimer.current = null; }
    };
  }, [autoRecenter, locationEnabled, fetchFix, recenter]);

  const toggleAutoRecenter = () => {
    if (!locationEnabled) {
      setLocError("off");
      return;
    }

    setAutoRecenter((v) => {
      const next = !v;
      try { localStorage.setItem(AUTO_RECENTER_KEY, String(next)); } catch {}
      haptic("light");
      toast({
        title: next ? "Auto-recenter on" : "Auto-recenter off",
        description: next ? "Map will follow your location every 20s." : "Map will stay put.",
      });
      return next;
    });
  };

  // Sync location toggle if changed elsewhere (Settings).
  useEffect(() => {
    const onStorage = () => {
      try { setLocationEnabled(localStorage.getItem(LOCATION_KEY) === "true"); } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);


  const propertyPins: Pin[] = properties
    .filter((p) => p.county === "Nairobi")
    .map((p) => {
      const pos = project(p.lat, p.lng);
      return {
        id: p.id,
        type: p.type === "rental" ? "rental" : "shortstay",
        label: `KES ${(p.price / 1000).toFixed(0)}K`,
        x: pos.x,
        y: pos.y,
        price: `KES ${new Intl.NumberFormat("en-KE").format(p.price)}${p.priceUnit}`,
        name: p.title,
      };
    });

  const servicePins: Pin[] = serviceProviders
    .filter((s) => s.areaServed.includes("Nairobi"))
    .map((s) => {
      const pos = project(s.lat, s.lng);
      return {
        id: s.id,
        type: "service" as PinType,
        label: s.avatar,
        x: pos.x,
        y: pos.y,
        name: s.name,
        avatar: s.avatar,
      };
    });

  const allPins = [
    ...(filter === "all" || filter === "rentals" ? propertyPins.filter((p) => p.type === "rental") : []),
    ...(filter === "all" || filter === "shortstays" ? propertyPins.filter((p) => p.type === "shortstay") : []),
    ...(filter === "all" || filter === "services" ? servicePins : []),
  ];

  const selected = selectedPin
    ? properties.find((p) => p.id === selectedPin) || serviceProviders.find((s) => s.id === selectedPin)
    : null;

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col animate-slide-up pb-20">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="text-lg font-bold flex-1">Discover Nearby</h1>
        <div className="flex items-center gap-1 text-xs text-primary font-medium">
          <Navigation className="w-3.5 h-3.5" />
          Nairobi
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 pb-3 flex gap-2">
        {[
          { key: "all", label: "All" },
          { key: "rentals", label: "Rentals" },
          { key: "shortstays", label: "Short Stays" },
          { key: "services", label: "Services" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? "gradient-trust text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* GPS status + auto-recenter */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-medium ${
          gpsFix ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
        }`}>
          {gpsFix ? <Crosshair className="w-3 h-3" /> : <CircleOff className="w-3 h-3" />}
          {gpsFix
            ? <>±{Math.round(gpsFix.accuracy)}m · {formatAgo(gpsFix.ts)}</>
            : locationEnabled ? "No GPS fix yet" : "Location off"}
        </div>
        <button
          onClick={toggleAutoRecenter}
          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-colors ${
            autoRecenter && locationEnabled
              ? "gradient-trust text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          } ${!locationEnabled ? "opacity-60" : ""}`}
          aria-pressed={autoRecenter}
        >
          <Navigation className="w-3 h-3" />
          Auto-recenter {autoRecenter && locationEnabled ? "on" : "off"}
        </button>
      </div>

      {/* Location error banner */}
      {locError && (
        <div className="px-4 pb-3 animate-fade-in">
          <div className={`rounded-xl border p-3 flex gap-3 ${
            locError === "denied"
              ? "bg-destructive/10 border-destructive/30"
              : "bg-secondary border-border"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              locError === "denied" ? "bg-destructive/20 text-destructive" : "bg-primary/15 text-primary"
            }`}>
              {locError === "denied" ? <AlertTriangle className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">
                {locError === "off" && "Location Services are off"}
                {locError === "denied" && "Location permission denied"}
                {locError === "unavailable" && "Location unavailable"}
                {locError === "timeout" && "Couldn't get a GPS fix"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {locError === "off" && "Turn on Location Services to see nearby listings and center the map on you."}
                {locError === "denied" && "KejaSure needs Location permission from your device to show your position on the map."}
                {locError === "unavailable" && "Your device can't get a signal right now. Move to an open area and try again."}
                {locError === "timeout" && "The GPS took too long to respond. Try again in a moment."}
              </p>
              <div className="flex gap-2 mt-2">
                {locError === "off" && (
                  <button
                    onClick={enableInAppLocation}
                    className="px-3 py-1.5 rounded-full gradient-trust text-primary-foreground text-[10px] font-semibold"
                  >
                    Turn on Location
                  </button>
                )}
                {(locError === "denied" || locError === "unavailable") && (
                  <button
                    onClick={handleOpenSettings}
                    className="px-3 py-1.5 rounded-full gradient-trust text-primary-foreground text-[10px] font-semibold flex items-center gap-1"
                  >
                    <SettingsIcon className="w-3 h-3" />
                    Open Settings
                  </button>
                )}
                {(locError === "timeout" || locError === "unavailable") && (
                  <button
                    onClick={() => fetchFix()}
                    className="px-3 py-1.5 rounded-full bg-background border border-border text-[10px] font-semibold text-foreground"
                  >
                    Try again
                  </button>
                )}
                <button
                  onClick={() => setLocError(null)}
                  className="px-3 py-1.5 rounded-full text-[10px] font-medium text-muted-foreground ml-auto"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mock Map */}
      <div
        className="flex-1 relative bg-muted overflow-hidden mx-4 rounded-2xl touch-none"
        {...touchHandlers}
      >
        {/* Grid lines for map feel */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox={`0 0 ${MAP_W} ${MAP_H}`}>
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 22} x2={MAP_W} y2={i * 22} stroke="currentColor" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`v${i}`} x1={i * 22} y1={0} x2={i * 22} y2={MAP_H} stroke="currentColor" strokeWidth={0.5} />
          ))}
          {/* Roads */}
          <line x1={0} y1={MAP_H / 2} x2={MAP_W} y2={MAP_H / 2} stroke="currentColor" strokeWidth={2} opacity={0.3} />
          <line x1={MAP_W / 2} y1={0} x2={MAP_W / 2} y2={MAP_H} stroke="currentColor" strokeWidth={2} opacity={0.3} />
          <line x1={0} y1={MAP_H * 0.3} x2={MAP_W} y2={MAP_H * 0.7} stroke="currentColor" strokeWidth={1.5} opacity={0.2} />
        </svg>

        {/* Area labels */}
        <span className="absolute text-[9px] font-medium text-muted-foreground/40 uppercase tracking-wider" style={{ top: "15%", left: "15%" }}>Westlands</span>
        <span className="absolute text-[9px] font-medium text-muted-foreground/40 uppercase tracking-wider" style={{ top: "45%", left: "25%" }}>Kilimani</span>
        <span className="absolute text-[9px] font-medium text-muted-foreground/40 uppercase tracking-wider" style={{ top: "65%", right: "15%" }}>South B</span>
        <span className="absolute text-[9px] font-medium text-muted-foreground/40 uppercase tracking-wider" style={{ top: "80%", left: "10%" }}>Karen</span>
        <span className="absolute text-[9px] font-medium text-muted-foreground/40 uppercase tracking-wider" style={{ top: "10%", right: "15%" }}>Roysambu</span>

        {/* Pins */}
        <MapPins pins={allPins} selectedPin={selectedPin} onSelect={setSelectedPin} />

        {/* User location */}
        <div
          className="absolute z-30"
          style={{ left: MAP_W / 2 + pan.x, top: MAP_H / 2 + pan.y, transform: "translate(-50%, -50%)" }}
        >
          {/* Compass cone (heading) */}
          {heading != null && (
            <div
              className="absolute left-1/2 top-1/2 pointer-events-none"
              style={{ transform: `translate(-50%, -50%) rotate(${heading}deg)` }}
            >
              <div
                className="w-0 h-0 -translate-y-6"
                style={{
                  borderLeft: "10px solid transparent",
                  borderRight: "10px solid transparent",
                  borderBottom: "16px solid rgba(59,130,246,0.55)",
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
                }}
              />
            </div>
          )}
          <div className="w-4 h-4 rounded-full bg-blue-500 border-3 border-card shadow-lg animate-pulse relative z-10" />
          <div className="absolute -inset-3 rounded-full bg-blue-500/20 animate-ping" />
          {showHereTooltip && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1 rounded-lg bg-foreground text-background text-[10px] font-semibold whitespace-nowrap shadow-lg animate-fade-in pointer-events-none">
              You are here
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground" />
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <ZoomControls
          zoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onRecenter={handleRecenter}
          isCentered={isCentered}
        />
      </div>

      {/* Selected card — snap points: peek / expanded */}
      {selected && (() => {
        const [snap, setSnap] = [mapSnap, setMapSnap];
        return (
          <div className="px-4 pt-1 pb-3 animate-fade-in">
            <div
              onClick={() => {
                haptic("light");
                setSnap(snap === "peek" ? "expanded" : "peek");
              }}
              onTouchStart={(e) => { (e.currentTarget as any)._startY = e.touches[0].clientY; }}
              onTouchEnd={(e) => {
                const startY = (e.currentTarget as any)._startY;
                if (startY == null) return;
                const dy = e.changedTouches[0].clientY - startY;
                if (dy < -40) { haptic("light"); setSnap("expanded"); }
                else if (dy > 40) { haptic("light"); setSnap("peek"); }
              }}
              className="flex justify-center py-1 cursor-pointer active:opacity-70"
            >
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>
            {snap === "expanded" ? (
              <SelectedCard selected={selected} onSelectProperty={onSelectProperty} />
            ) : (
              <button
                onClick={() => onSelectProperty(selected.property)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card card-shadow active:scale-[0.99] transition-transform"
              >
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0">🏠</div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold truncate">{selected.property.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{selected.property.estate}, {selected.property.county}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">KES {selected.property.price.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Tap for more</p>
                </div>
              </button>
            )}
          </div>
        );
      })()}

      {!selected && (
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Tap a pin to see details</p>
        </div>
      )}
    </div>
  );
};

export default MapDiscovery;

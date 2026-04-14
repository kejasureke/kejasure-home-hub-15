import { useState, useCallback } from "react";
import { ArrowLeft, MapPin, Navigation, Star, Bed, ShieldCheck, Wrench, Home, ChevronRight, Plus, Minus } from "lucide-react";
import { properties, serviceProviders, type Property, type ServiceProvider } from "@/data/mockData";

interface MapDiscoveryProps {
  onBack: () => void;
  onSelectProperty: (id: string) => void;
}

// Nairobi center
const CENTER = { lat: -1.2864, lng: 36.8172 };
const MAP_W = 390;
const MAP_H = 420;

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

// Convert lat/lng to pixel position on mock map
const toPixel = (lat: number, lng: number, zoom: number, panX: number, panY: number) => {
  const scale = 3500 * zoom;
  const x = (lng - CENTER.lng) * scale + MAP_W / 2 + panX;
  const y = (CENTER.lat - lat) * scale + MAP_H / 2 + panY;
  return { x, y };
};

type PinType = "rental" | "shortstay" | "service";

interface Pin {
  id: string;
  type: PinType;
  label: string;
  x: number;
  y: number;
  price?: string;
  name?: string;
  avatar?: string;
}

const MapDiscovery = ({ onBack, onSelectProperty }: MapDiscoveryProps) => {
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "rentals" | "shortstays" | "services">("all");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP)), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setPanStart(pan);
    }
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragging && e.touches.length === 1) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      setPan({ x: panStart.x + dx, y: panStart.y + dy });
    }
  }, [dragging, dragStart, panStart]);

  const handleTouchEnd = useCallback(() => setDragging(false), []);

  const propertyPins: Pin[] = properties
    .filter((p) => p.county === "Nairobi")
    .map((p) => {
      const pos = toPixel(p.lat, p.lng, zoom, pan.x, pan.y);
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
      const pos = toPixel(s.lat, s.lng, zoom, pan.x, pan.y);
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

  const isProperty = selected && "bedrooms" in selected;

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

      {/* Mock Map */}
      <div
        className="flex-1 relative bg-muted overflow-hidden mx-4 rounded-2xl touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
        {allPins.map((pin) => (
          <button
            key={pin.id}
            onClick={() => setSelectedPin(pin.id)}
            className={`absolute transition-all duration-200 ${selectedPin === pin.id ? "z-20 scale-125" : "z-10"}`}
            style={{ left: pin.x, top: pin.y, transform: "translate(-50%, -100%)" }}
          >
            {pin.type === "service" ? (
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-md ${
                selectedPin === pin.id ? "bg-accent text-accent-foreground" : "bg-card text-foreground"
              }`}>
                {pin.avatar}
              </div>
            ) : (
              <div className={`px-2 py-1 rounded-lg text-[10px] font-bold shadow-md whitespace-nowrap ${
                selectedPin === pin.id
                  ? "gradient-trust text-primary-foreground"
                  : pin.type === "rental"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground"
              }`}>
                {pin.label}
              </div>
            )}
            {/* Pin tail */}
            <div className={`w-0 h-0 mx-auto border-l-[5px] border-r-[5px] border-t-[6px] border-transparent ${
              selectedPin === pin.id
                ? "border-t-primary"
                : pin.type === "service"
                ? "border-t-card"
                : pin.type === "rental"
                ? "border-t-primary"
                : "border-t-accent"
            }`} />
          </button>
        ))}

        {/* User location */}
        <div
          className="absolute z-30"
          style={{ left: MAP_W / 2 + pan.x, top: MAP_H / 2 + pan.y, transform: "translate(-50%, -50%)" }}
        >
          <div className="w-4 h-4 rounded-full bg-blue-500 border-3 border-card shadow-lg animate-pulse" />
          <div className="absolute -inset-3 rounded-full bg-blue-500/20 animate-ping" />
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 z-40 flex flex-col gap-1.5">
          <button
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            className="w-9 h-9 rounded-xl bg-card shadow-md flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
          >
            <Plus className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            className="w-9 h-9 rounded-xl bg-card shadow-md flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40"
          >
            <Minus className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Zoom level indicator */}
        <div className="absolute top-3 right-3 z-40 px-2 py-1 rounded-lg bg-card/80 shadow-sm">
          <span className="text-[10px] font-medium text-muted-foreground">{zoom.toFixed(1)}x</span>
        </div>
      </div>

      {/* Selected card */}
      {selected && (
        <div className="px-4 py-3 animate-fade-in">
          {isProperty ? (
            <button
              onClick={() => onSelectProperty((selected as Property).id)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform"
            >
              <img
                src={(selected as Property).image}
                alt={(selected as Property).title}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold truncate">{(selected as Property).title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs font-bold text-primary">
                    KES {new Intl.NumberFormat("en-KE").format((selected as Property).price)}
                    <span className="font-normal text-muted-foreground">{(selected as Property).priceUnit}</span>
                  </p>
                  {(selected as Property).verified && <ShieldCheck className="w-3 h-3 text-primary" />}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Bed className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{(selected as Property).bedrooms} BR</span>
                  {(selected as Property).rating && (
                    <>
                      <Star className="w-3 h-3 text-accent fill-accent" />
                      <span className="text-[10px] text-muted-foreground">{(selected as Property).rating}</span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card card-shadow">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl">
                {(selected as ServiceProvider).avatar}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">{(selected as ServiceProvider).name}</p>
                <p className="text-xs text-muted-foreground">{(selected as ServiceProvider).category}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-[10px] font-medium">{(selected as ServiceProvider).rating}</span>
                  <span className="text-[10px] text-muted-foreground">({(selected as ServiceProvider).reviews})</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!selected && (
        <div className="px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">Tap a pin to see details</p>
        </div>
      )}
    </div>
  );
};

export default MapDiscovery;

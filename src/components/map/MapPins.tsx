export type PinType = "rental" | "shortstay" | "service";

export interface Pin {
  id: string;
  type: PinType;
  label: string;
  x: number;
  y: number;
  price?: string;
  name?: string;
  avatar?: string;
}

interface MapPinsProps {
  pins: Pin[];
  selectedPin: string | null;
  onSelect: (id: string) => void;
}

const MapPins = ({ pins, selectedPin, onSelect }: MapPinsProps) => (
  <>
    {pins.map((pin) => (
      <button
        key={pin.id}
        onClick={() => onSelect(pin.id)}
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
  </>
);

export default MapPins;

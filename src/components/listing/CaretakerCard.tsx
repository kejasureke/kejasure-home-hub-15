import { Lock, Phone, UserRound, ShieldCheck } from "lucide-react";
import type { Property } from "@/data/mockData";
import { useBookings } from "@/hooks/useBookings";
import { haptic } from "@/lib/despia";

const NAMES = ["Mzee Otieno", "Mama Wanjiru", "Kevin Mutua", "Ali Hassan", "Joseph Kiprop"];
const hash = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };

/** Caretaker added by the landlord/agent. Number stays locked until a booking is accepted. */
export function getCaretaker(p: Property): { name: string; phone: string } | null {
  try {
    const custom = JSON.parse(localStorage.getItem("kejasure_caretakers") || "{}")[p.id];
    if (custom?.phone) return custom;
  } catch {}
  const h = hash(p.id);
  if (!p.verified || h % 3 === 0) return null;
  return { name: NAMES[h % NAMES.length], phone: `+254 7${String(h).padStart(8, "0").slice(0, 2)} ${String(h).slice(-6, -3).padStart(3, "0")} ${String(h).slice(-3)}` };
}

const CaretakerCard = ({ property }: { property: Property }) => {
  const { bookings } = useBookings();
  const c = getCaretaker(property);
  if (!c) return null;
  const unlocked = bookings.some((b) => b.propertyId === property.id && (b.status === "accepted" || b.status === "completed"));

  return (
    <div className="mb-5 p-4 rounded-2xl bg-card card-shadow border border-border flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <UserRound className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold truncate">{c.name}</p>
          <ShieldCheck className="w-3.5 h-3.5 text-trust shrink-0" />
        </div>
        <p className="text-[10px] text-muted-foreground">
          Caretaker on site · {unlocked ? c.phone : "Number shows after your viewing is accepted"}
        </p>
      </div>
      {unlocked ? (
        <a href={`tel:${c.phone.replace(/\s/g, "")}`} onClick={() => haptic("light")} className="px-3 py-2 rounded-xl gradient-trust text-[11px] font-semibold text-primary-foreground flex items-center gap-1">
          <Phone className="w-3 h-3" /> Call
        </a>
      ) : (
        <span className="px-3 py-2 rounded-xl bg-muted text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
          <Lock className="w-3 h-3" /> Locked
        </span>
      )}
    </div>
  );
};

export default CaretakerCard;

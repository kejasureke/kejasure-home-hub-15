import { Lock, Phone, UserRound } from "lucide-react";
import type { Property } from "@/data/mockData";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/lib/despia";
import { usePaidAccess } from "@/hooks/usePaidAccess";
import { canRevealContact } from "@/lib/paidAccess";
import { translate, useLanguage } from "@/lib/language";
import PaidAccessNotice from "../PaidAccessNotice";

/** Caretaker added by the landlord/agent. Number stays locked until a booking is accepted. */
export function getCaretaker(p: Property): { name: string; phone: string } | null {
  try {
    const custom = JSON.parse(localStorage.getItem("kejasure_caretakers") || "{}")[p.id];
    if (custom?.phone) return custom;
  } catch {}
  return null;
}

const CaretakerCard = ({ property }: { property: Property }) => {
  useLanguage();
  const { hasActivePlan, loading } = usePaidAccess();
  const { user } = useAuth();
  const [acceptedFor, setAcceptedFor] = useState<string | null>(null);
  const accountListing = user ? `${user.id}:${property.id}` : null;
  useEffect(() => {
    setAcceptedFor(null);
    if (!user || !hasActivePlan || !/^[0-9a-f-]{36}$/i.test(property.id)) return;
    let cancelled = false;
    const refresh = async () => {
      const { data, error } = await supabase.from("bookings").select("id")
        .eq("guest_id", user.id).eq("listing_id", property.id).in("status", ["accepted", "completed"]).limit(1);
      if (!cancelled) setAcceptedFor(!error && data?.length ? accountListing : null);
    };
    void refresh();
    const timer = window.setInterval(refresh, 30000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [user?.id, property.id, hasActivePlan, accountListing]);
  const c = getCaretaker(property);
  if (!c) return null;
  const unlocked = !!accountListing && acceptedFor === accountListing && canRevealContact(hasActivePlan, "accepted");

  if (!hasActivePlan) return <div className="mb-5"><p className="text-sm font-semibold mb-2">{translate("Caretaker contact")}</p><PaidAccessNotice loading={loading} /></div>;

  return (
    <div className="mb-5 p-4 rounded-2xl bg-card card-shadow border border-border flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <UserRound className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold truncate">{c.name}</p>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {translate("Caretaker on site")} · {unlocked ? c.phone : translate("Number shows after your viewing is accepted")}
        </p>
      </div>
      {unlocked ? (
        <a href={`tel:${c.phone.replace(/\s/g, "")}`} onClick={() => haptic("light")} className="px-3 py-2 rounded-xl gradient-trust text-[11px] font-semibold text-primary-foreground flex items-center gap-1">
          <Phone className="w-3 h-3" /> {translate("Call")}
        </a>
      ) : (
        <span className="px-3 py-2 rounded-xl bg-muted text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
          <Lock className="w-3 h-3" /> {translate("Locked")}
        </span>
      )}
    </div>
  );
};

export default CaretakerCard;

import { useCallback, useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { translate, useLanguage } from "@/lib/language";
import { formatClock, isRecentlyTaken } from "@/lib/availability";

type L = { id: string; title: string; segment: string; status: string; taken_at: string | null; busy_until: string | null; job_capacity: number };
const HOME_SEGMENTS = ["rental", "commercial", "corporate"] as const;

const sixPmToday = () => { const d = new Date(); d.setHours(18, 0, 0, 0); return d.getTime() > Date.now() ? d : new Date(Date.now() + 60 * 60 * 1000); };

/**
 * homes: mark each home taken / available again.
 * services: busy switch + how many jobs the provider can take at the same time.
 */
const MyLiveListings = ({ kind }: { kind: "homes" | "services" }) => {
  useLanguage();
  const [list, setList] = useState<L[] | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setList([]); return; }
    let q = supabase.from("listings").select("id, title, segment, status, taken_at, busy_until, job_capacity").eq("owner_id", u.user.id).in("status", ["active", "rented"]);
    q = kind === "services" ? q.eq("segment", "service") : q.in("segment", [...HOME_SEGMENTS]);
    const { data } = await q.order("created_at", { ascending: false });
    setList((data as L[] | null) ?? []);
  }, [kind]);
  useEffect(() => { load(); }, [load]);

  if (!list || list.length === 0) return null;

  const update = async (ids: string[], patch: { status?: "active" | "rented"; busy_until?: string | null; job_capacity?: number }, ok: string) => {
    setSaving(true);
    const { error } = await supabase.from("listings").update(patch).in("id", ids);
    setSaving(false);
    if (error) {
      toast.error(error.message.startsWith("LISTING_LIMIT") ? translate("Your plan's active-listing limit is reached. Upgrade or mark another listing taken first.") : error.message);
      return;
    }
    toast.success(translate(ok));
    load();
  };

  if (kind === "services") {
    const ids = list.filter((l) => l.status === "active").map((l) => l.id);
    if (!ids.length) return null;
    const busyUntil = list.map((l) => l.busy_until).filter((b): b is string => !!b && new Date(b).getTime() > Date.now()).sort().pop();
    const cap = list[0].job_capacity ?? 1;
    const setBusy = (until: Date | null) => update(ids, { busy_until: until ? until.toISOString() : null }, until ? "You're shown as busy. Clients see free providers first." : "You're shown as available");
    return (
      <section className="bg-card rounded-2xl card-shadow p-4 mb-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{translate("Your availability")}</h3>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${busyUntil ? "bg-accent/15 text-foreground" : "bg-trust/10 text-trust"}`}>
            {busyUntil ? `🟠 ${translate("Busy until {time}").replace("{time}", formatClock(busyUntil))}` : `🟢 ${translate("Available now")}`}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">{translate("When you're busy, clients see free providers first. Paid boosts keep your spot.")}</p>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[{ l: "1 hr", h: 1 }, { l: "2 hrs", h: 2 }, { l: "4 hrs", h: 4 }].map((o) => (
            <button key={o.l} disabled={saving} onClick={() => setBusy(new Date(Date.now() + o.h * 3_600_000))} className="py-2 rounded-xl bg-secondary text-[11px] font-semibold active:scale-95 disabled:opacity-60">
              {translate("Busy")} {o.l}
            </button>
          ))}
          <button disabled={saving} onClick={() => setBusy(sixPmToday())} className="py-2 rounded-xl bg-secondary text-[11px] font-semibold active:scale-95 disabled:opacity-60">{translate("Till 6 PM")}</button>
        </div>
        {busyUntil && (
          <button disabled={saving} onClick={() => setBusy(null)} className="w-full mt-2 py-2.5 rounded-xl gradient-trust text-xs font-semibold text-primary-foreground active:scale-[0.98] disabled:opacity-60">
            {translate("I'm free now")}
          </button>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="pr-3">
            <p className="text-xs font-semibold">{translate("Jobs at the same time")}</p>
            <p className="text-[10px] text-muted-foreground">{translate("Have a team? Clients can book you for this many jobs at one time slot.")}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button aria-label={translate("Fewer jobs")} disabled={saving || cap <= 1} onClick={() => update(ids, { job_capacity: cap - 1 }, "Saved")} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center disabled:opacity-40"><Minus className="w-4 h-4" /></button>
            <span className="w-5 text-center text-sm font-bold">{cap}</span>
            <button aria-label={translate("More jobs")} disabled={saving || cap >= 10} onClick={() => update(ids, { job_capacity: cap + 1 }, "Saved")} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center disabled:opacity-40"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-5">
      <h3 className="text-base font-semibold mb-1">{translate("Your homes")}</h3>
      <p className="text-[11px] text-muted-foreground mb-3">{translate("Mark a home taken once a tenant agrees. Tenants see “Taken” for 3 days, then it's hidden.")}</p>
      <div className="space-y-2">
        {list.map((l) => {
          const taken = l.status === "rented";
          return (
            <div key={l.id} className="bg-card rounded-xl card-shadow p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{l.title}</p>
                <p className={`text-[11px] ${taken ? "text-muted-foreground" : "text-trust font-semibold"}`}>
                  {taken ? (isRecentlyTaken(l.taken_at) ? translate("Taken — visible to tenants for 3 days") : translate("Taken — hidden from tenants")) : translate("Available")}
                </p>
              </div>
              <button
                disabled={saving}
                onClick={() => update([l.id], { status: taken ? "active" : "rented" }, taken ? "Home is available again" : "Marked as taken. Waiting requests were closed.")}
                className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-semibold active:scale-95 disabled:opacity-60 ${taken ? "gradient-trust text-primary-foreground" : "bg-foreground text-background"}`}
              >
                {translate(taken ? "Available again" : "Mark taken")}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MyLiveListings;

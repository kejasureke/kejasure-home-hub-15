import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Check, Clock, Home, Loader2, Users, Wrench, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { translate, useLanguage } from "@/lib/language";
import { closeReasonLabel, expireStaleRequests, formatClock, requestErrorMessage, waitLimitMs } from "@/lib/availability";

type Row = {
  id: string; listing_id: string; listing_title: string; listing_segment: string; listing_status: string;
  type: string; status: string; check_in: string | null; check_out: string | null; guests: number | null;
  slot_at: string | null; close_reason: string | null; created_at: string; guest_name: string;
};

const HOME_SEGMENTS = ["rental", "commercial", "corporate"];
const fmtDay = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" }) : "");

const leftLabel = (r: Row) => {
  const left = waitLimitMs(r.type) - (Date.now() - new Date(r.created_at).getTime());
  if (left <= 0) return translate("Closing — no reply in time");
  const h = Math.floor(left / 3_600_000), m = Math.floor((left % 3_600_000) / 60_000);
  return `${translate("Reply within")} ${h > 0 ? `${h}h ` : ""}${m}m`;
};

/** Real requests sent to this provider's listings, with accept/decline and "mark taken" in one place. */
const IncomingRequests = ({ title = "Booking Requests" }: { title?: string }) => {
  useLanguage();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [showClosed, setShowClosed] = useState(false);
  const [, tick] = useState(0);

  const load = useCallback(async () => {
    await expireStaleRequests();
    const { data } = await supabase.rpc("my_incoming_requests");
    setRows((data as Row[] | null) ?? []);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => { load(); tick((n) => n + 1); }, 30000);
    return () => clearInterval(t);
  }, [load]);

  const setStatus = async (r: Row, status: "accepted" | "declined" | "completed") => {
    setBusy(r.id);
    const { error } = await supabase.from("bookings").update({ status }).eq("id", r.id);
    setBusy(null);
    if (error) { toast.error(requestErrorMessage(error.message).message); load(); return; }
    toast.success(status === "accepted" ? translate("Accepted — contacts are now shared") : status === "declined" ? translate("Request declined") : translate("Marked as done"));
    load();
  };

  const markTaken = async (r: Row) => {
    setBusy(r.id);
    const { error } = await supabase.from("listings").update({ status: "rented" }).eq("id", r.listing_id);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success(translate("Marked as taken. Other waiting requests were closed and tenants were told."));
    load();
  };

  const open = (rows ?? []).filter((r) => r.status === "requested" || r.status === "accepted");
  const closed = (rows ?? []).filter((r) => !open.includes(r));

  const when = (r: Row) => {
    if (r.type === "short_stay") return `${fmtDay(r.check_in)} → ${fmtDay(r.check_out)}`;
    if (r.slot_at) return `${fmtDay(r.slot_at)} · ${formatClock(r.slot_at)}`;
    return fmtDay(r.check_in);
  };
  const Icon = (r: Row) => (r.type === "service" ? Wrench : r.type === "short_stay" ? CalendarDays : Home);

  return (
    <section className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">{translate(title)}</h3>
        {open.some((r) => r.status === "requested") && (
          <span className="px-2 py-0.5 rounded-full bg-accent/15 text-[11px] font-bold">{open.filter((r) => r.status === "requested").length} {translate("waiting")}</span>
        )}
      </div>

      {rows === null ? (
        <div className="bg-card rounded-2xl card-shadow p-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : open.length === 0 ? (
        <div className="bg-card rounded-2xl card-shadow p-5 text-center">
          <p className="text-sm font-semibold">{translate("No requests right now")}</p>
          <p className="text-xs text-muted-foreground mt-1">{translate("New requests show here. Reply fast — services close after 2 hours, homes and stays after 24 hours.")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {open.map((r) => {
            const I = Icon(r);
            const isHome = HOME_SEGMENTS.includes(r.listing_segment);
            return (
              <div key={r.id} className="bg-card rounded-2xl card-shadow p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><I className="w-4 h-4 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{r.guest_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.listing_title}</p>
                    <p className="text-xs mt-1 flex items-center gap-1.5 flex-wrap">
                      <CalendarDays className="w-3 h-3 text-muted-foreground" /> {when(r)}
                      {r.guests ? <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-3 h-3" />{r.guests}</span> : null}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${r.status === "accepted" ? "bg-trust/10 text-trust" : "bg-accent/15 text-foreground"}`}>
                    {translate(r.status === "accepted" ? "Accepted" : "Waiting")}
                  </span>
                </div>

                {r.status === "requested" ? (
                  <>
                    <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{leftLabel(r)}</p>
                    <div className="flex gap-2 mt-3">
                      <button disabled={busy === r.id} onClick={() => setStatus(r, "accepted")} className="flex-1 py-2.5 rounded-xl gradient-trust text-xs font-semibold text-primary-foreground flex items-center justify-center gap-1 active:scale-[0.98] disabled:opacity-60">
                        <Check className="w-3.5 h-3.5" /> {translate("Accept")}
                      </button>
                      <button disabled={busy === r.id} onClick={() => setStatus(r, "declined")} className="flex-1 py-2.5 rounded-xl bg-secondary text-xs font-semibold flex items-center justify-center gap-1 active:scale-[0.98] disabled:opacity-60">
                        <X className="w-3.5 h-3.5" /> {translate("Decline")}
                      </button>
                    </div>
                  </>
                ) : isHome && r.listing_status === "active" ? (
                  <div className="mt-3 p-3 rounded-xl bg-secondary">
                    <p className="text-[11px] text-muted-foreground mb-2">{translate("Did {name} take the home? Mark it taken so others stop requesting.").replace("{name}", r.guest_name)}</p>
                    <button disabled={busy === r.id} onClick={() => markTaken(r)} className="w-full py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold active:scale-[0.98] disabled:opacity-60">
                      {translate("Mark home as taken")}
                    </button>
                  </div>
                ) : r.type !== "viewing" ? (
                  <button disabled={busy === r.id} onClick={() => setStatus(r, "completed")} className="w-full mt-3 py-2.5 rounded-xl bg-secondary text-xs font-semibold active:scale-[0.98] disabled:opacity-60">
                    {translate(r.type === "service" ? "Mark job done" : "Mark stay completed")}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {closed.length > 0 && (
        <div className="mt-3">
          <button onClick={() => setShowClosed((v) => !v)} className="text-xs font-semibold text-primary">
            {translate(showClosed ? "Hide recently closed" : "Show recently closed")} ({closed.length})
          </button>
          {showClosed && (
            <div className="space-y-2 mt-2">
              {closed.map((r) => (
                <div key={r.id} className="bg-card rounded-xl p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{r.guest_name} · {r.listing_title}</p>
                    <p className="text-[11px] text-muted-foreground">{when(r)}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground text-right shrink-0">
                    {translate(closeReasonLabel(r.close_reason) ?? (r.status === "completed" ? "Completed" : r.status === "cancelled" ? "Cancelled by tenant" : "Declined"))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default IncomingRequests;

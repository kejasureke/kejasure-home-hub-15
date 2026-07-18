import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, MapPin, Clock, CheckCircle2, XCircle, Loader2, MessageCircle, Phone, ShieldAlert, Calendar, MoreVertical, CalendarClock, Star } from "lucide-react";
import { useBookings, type BookingStatus, type Booking } from "@/hooks/useBookings";
import BookingRescheduleModal from "./BookingRescheduleModal";
import { toast } from "sonner";

interface MyBookingsScreenProps {
  onBack: () => void;
  onOpenChat?: (propertyId: string) => void;
}

const TABS: { id: BookingStatus | "all"; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "accepted", label: "Accepted" },
  { id: "completed", label: "Past" },
  { id: "all", label: "All" },
];

const fmtKES = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" });
};

const statusBadge = (s: BookingStatus) => {
  switch (s) {
    case "pending":   return { cls: "bg-accent/10 text-accent-foreground border-accent/20", icon: Loader2, label: "Pending", spin: true };
    case "accepted":  return { cls: "bg-trust/10 text-trust border-trust/20", icon: CheckCircle2, label: "Accepted" };
    case "declined":  return { cls: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle, label: "Declined" };
    case "cancelled": return { cls: "bg-muted text-muted-foreground border-border", icon: XCircle, label: "Cancelled" };
    case "completed": return { cls: "bg-secondary text-secondary-foreground border-border", icon: CheckCircle2, label: "Completed" };
  }
};

const MyBookingsScreen = ({ onBack, onOpenChat }: MyBookingsScreenProps) => {
  const { bookings, counts, cancelBooking, updateBooking } = useBookings();
  const [tab, setTab] = useState<BookingStatus | "all">("pending");
  const [actionFor, setActionFor] = useState<Booking | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<Booking | null>(null);
  const [reviewed, setReviewed] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("kejasure_reviewed_bookings") || "[]")); } catch { return new Set(); }
  });
  const [, tick] = useState(0);

  // Re-render every 30s so check-in countdowns stay fresh
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const markReviewed = (id: string) => {
    const next = new Set(reviewed);
    next.add(id);
    setReviewed(next);
    try { localStorage.setItem("kejasure_reviewed_bookings", JSON.stringify([...next])); } catch {}
    toast.success("Thanks for your review!");
  };
  

  const filtered = useMemo(() => {
    if (tab === "all") return bookings;
    if (tab === "completed") return bookings.filter((b) => ["completed", "declined", "cancelled"].includes(b.status));
    return bookings.filter((b) => b.status === tab);
  }, [bookings, tab]);

  return (
    <div className="fixed inset-0 z-[80] bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-safe pb-3 flex items-center gap-3 border-b border-border">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold text-foreground">My Bookings</h1>
          <p className="text-[11px] text-muted-foreground">Track viewings and stays</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          const count =
            t.id === "pending" ? counts.pending :
            t.id === "accepted" ? counts.accepted :
            t.id === "completed" ? bookings.filter((b) => ["completed", "declined", "cancelled"].includes(b.status)).length :
            counts.all;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                isActive ? "gradient-trust text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {t.label}
              {count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? "bg-primary-foreground/20" : "bg-card text-foreground"
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pt-2 pb-32 scrollbar-none">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Calendar className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">No bookings yet</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Browse listings and tap "Book a Viewing" or "Book Stay" to send a request.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => {
              const badge = statusBadge(b.status);
              const Icon = badge.icon;
              const isStay = b.kind === "shortstay";
              return (
                <div key={b.id} className="bg-card rounded-2xl card-shadow overflow-hidden animate-fade-in">
                  <div className="flex gap-3 p-3">
                    <img src={b.propertyImage} alt={b.propertyTitle} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-foreground line-clamp-1">{b.propertyTitle}</h4>
                        <button onClick={() => setActionFor(b)} className="-mt-1 -mr-1 p-1 active:opacity-60" aria-label="Booking actions">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {b.estate}, {b.county}
                      </p>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-2 ${badge.cls}`}>
                        <Icon className={`w-3 h-3 ${badge.spin ? "animate-spin" : ""}`} />
                        {badge.label}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-3 pt-1 space-y-1 text-xs">
                    {isStay ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stay</span>
                          <span className="font-medium text-foreground">{formatDate(b.date)} → {formatDate(b.checkOut || "")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{b.nights} night{b.nights !== 1 ? "s" : ""} · {b.guests} guest{(b.guests || 0) !== 1 ? "s" : ""}</span>
                          <span className="font-bold text-primary">{fmtKES(b.totalPrice || 0)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Viewing</span>
                        <span className="font-medium text-foreground">{formatDate(b.date)} · {b.time}</span>
                      </div>
                    )}
                    {b.status === "pending" && b.responseTime && (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                        <Clock className="w-3 h-3" /> Avg response: {b.responseTime}
                      </div>
                    )}
                    {b.status === "accepted" && (() => {
                      const target = new Date(b.date).getTime();
                      const diff = target - Date.now();
                      if (diff < -86400000) return null; // >1 day past
                      const days = Math.ceil(diff / 86400000);
                      const label =
                        diff < 0 ? (isStay ? "Check-in today" : "Viewing today") :
                        days === 0 ? (isStay ? "Check-in today" : "Viewing today") :
                        days === 1 ? (isStay ? "Check-in tomorrow" : "Viewing tomorrow") :
                        `${isStay ? "Check-in" : "Viewing"} in ${days} days`;
                      return (
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-trust pt-1">
                          <CalendarClock className="w-3 h-3" /> {label}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Actions */}
                  {b.status === "accepted" && (
                    <div className="px-3 pb-3 flex gap-2">
                      {b.landlordPhone && (
                        <a
                          href={`tel:${b.landlordPhone.replace(/\s/g, "")}`}
                          className="flex-1 py-2.5 rounded-xl bg-trust/10 text-xs font-semibold text-trust active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                      )}
                      <button
                        onClick={() => onOpenChat?.(b.propertyId)}
                        className="flex-1 py-2.5 rounded-xl bg-primary/10 text-xs font-semibold text-primary active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Chat
                      </button>
                      <button
                        onClick={() => setRescheduleFor(b)}
                        className="flex-1 py-2.5 rounded-xl bg-secondary text-xs font-semibold text-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
                      >
                        <CalendarClock className="w-3.5 h-3.5" /> Reschedule
                      </button>
                    </div>
                  )}

                  {/* Safety reminder for accepted stays */}
                  {b.status === "accepted" && isStay && (
                    <div className="mx-3 mb-3 flex items-start gap-2 p-2.5 rounded-xl bg-accent/5 border border-accent/20">
                      <ShieldAlert className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-accent-foreground">Safety:</span> Arrange payment directly with the host on arrival. KejaSure does not handle rent or deposits — never send money before viewing.
                      </p>
                    </div>
                  )}

                  {/* Post-stay review prompt */}
                  {b.status === "completed" && !reviewed.has(b.id) && (
                    <div className="mx-3 mb-3 p-3 rounded-xl bg-gold/10 border border-gold/30 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                        <Star className="w-4 h-4 text-gold-foreground fill-gold-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">How was your experience?</p>
                        <p className="text-[10px] text-muted-foreground">Help others by leaving a quick review.</p>
                      </div>
                      <button
                        onClick={() => markReviewed(b.id)}
                        className="shrink-0 px-3 py-1.5 rounded-lg gradient-trust text-[10px] font-bold text-primary-foreground active:scale-95"
                      >
                        Rate
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action sheet */}
      {actionFor && (
        <div className="fixed inset-0 z-[85] flex items-end bg-foreground/30" onClick={() => setActionFor(null)}>
          <div className="w-full bg-card rounded-t-3xl p-5 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <p className="text-sm font-bold text-foreground mb-1 line-clamp-1">{actionFor.propertyTitle}</p>
            <p className="text-[11px] text-muted-foreground mb-4">{statusBadge(actionFor.status).label}</p>

            <div className="space-y-2">
              {(actionFor.status === "pending" || actionFor.status === "accepted") && (
                <button
                  onClick={() => { setRescheduleFor(actionFor); setActionFor(null); }}
                  className="w-full py-3 rounded-xl bg-secondary text-sm font-semibold text-foreground active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CalendarClock className="w-4 h-4" /> Reschedule
                </button>
              )}
              {(actionFor.status === "pending" || actionFor.status === "accepted") && (
                <button
                  onClick={() => { cancelBooking(actionFor.id); setActionFor(null); }}
                  className="w-full py-3 rounded-xl bg-destructive/10 text-sm font-semibold text-destructive active:scale-[0.98]"
                >
                  Cancel booking
                </button>
              )}
              {actionFor.status === "accepted" && (
                <button
                  onClick={() => { updateBooking(actionFor.id, { status: "completed" }); setActionFor(null); }}
                  className="w-full py-3 rounded-xl bg-secondary text-sm font-semibold text-foreground active:scale-[0.98]"
                >
                  Mark as completed
                </button>
              )}
              <button
                onClick={() => setActionFor(null)}
                className="w-full py-3 rounded-xl bg-muted text-sm font-medium text-muted-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {rescheduleFor && (
        <BookingRescheduleModal
          booking={rescheduleFor}
          onClose={() => setRescheduleFor(null)}
          onSave={(patch) => updateBooking(rescheduleFor.id, patch)}
        />
      )}

    </div>
  );
};

export default MyBookingsScreen;

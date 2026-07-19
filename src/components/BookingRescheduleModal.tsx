import { useState } from "react";
import { Calendar, Clock, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Booking } from "@/hooks/useBookings";
import { useHardwareBack } from "@/hooks/useHardwareBack";

interface Props {
  booking: Booking;
  onClose: () => void;
  onSave: (patch: Partial<Booking>) => void;
}

const times = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const isoIn = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
};

const label = (iso: string) => new Date(iso).toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" });

const BookingRescheduleModal = ({ booking, onClose, onSave }: Props) => {
  const isStay = booking.kind === "shortstay";
  const [date, setDate] = useState(booking.date.slice(0, 10));
  const [checkOut, setCheckOut] = useState(booking.checkOut?.slice(0, 10) || isoIn(3));
  const [time, setTime] = useState(booking.time || times[1]);

  const dateOptions = Array.from({ length: 10 }, (_, i) => isoIn(i + 1));

  const save = () => {
    const patch: Partial<Booking> = isStay
      ? { date, checkOut, status: "pending" }
      : { date, time, status: "pending" };
    onSave(patch);
    toast.success("Reschedule request sent", {
      description: "The host has been notified and will confirm shortly.",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-foreground/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full bg-card rounded-t-3xl p-5 animate-slide-up max-h-[85vh] overflow-y-auto scrollbar-none" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />

        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Reschedule {isStay ? "stay" : "viewing"}</h3>
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{booking.propertyTitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> {isStay ? "New check-in date" : "New date"}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1 mb-4">
          {dateOptions.map((d) => {
            const active = d === date;
            return (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  active ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground border-transparent"
                }`}
              >
                {label(d)}
              </button>
            );
          })}
        </div>

        {isStay ? (
          <>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> New check-out date
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1 mb-4">
              {dateOptions.filter((d) => d > date).map((d) => {
                const active = d === checkOut;
                return (
                  <button
                    key={d}
                    onClick={() => setCheckOut(d)}
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      active ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground border-transparent"
                    }`}
                  >
                    {label(d)}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> New time
            </p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {times.map((t) => {
                const active = t === time;
                return (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={`py-2 rounded-xl text-[11px] font-semibold border transition-all ${
                      active ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground border-transparent"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-accent/5 border border-accent/20 mb-4">
          <CheckCircle2 className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Rescheduling resets the request status. The host will need to accept the new date.
          </p>
        </div>

        <button
          onClick={save}
          className="w-full py-3.5 rounded-xl gradient-trust text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform"
        >
          Send reschedule request
        </button>
      </div>
    </div>
  );
};

export default BookingRescheduleModal;

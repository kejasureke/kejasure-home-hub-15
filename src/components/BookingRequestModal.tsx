import { X, Calendar, Clock, MapPin, CheckCircle2, Loader2, Phone, MessageCircle, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import type { Property } from "@/data/mockData";
import { pushGlobalAlert } from "@/hooks/useInAppNotifications";

interface BookingRequestModalProps {
  property: Property;
  onClose: () => void;
}

type BookingStep = "select" | "confirm" | "pending" | "accepted" | "declined";

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

const BookingRequestModal = ({ property, onClose }: BookingRequestModalProps) => {
  const [step, setStep] = useState<BookingStep>("select");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [note, setNote] = useState("");

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-KE", { weekday: "short" }),
      date: d.toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
      value: d.toISOString().split("T")[0],
    };
  });

  const isShortStay = property.type === "shortstay";
  const title = isShortStay ? "Book Your Stay" : "Request a Viewing";

  // Simulate landlord acceptance after a delay
  useEffect(() => {
    if (step === "pending") {
      const timer = setTimeout(() => {
        setStep("accepted");
        pushGlobalAlert({
          type: "booking",
          title: `${isShortStay ? "Booking" : "Viewing"} Accepted! 🎉`,
          body: `Your ${isShortStay ? "booking" : "viewing"} for ${property.title} has been confirmed.`,
        });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [step, isShortStay, property.title]);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-h-[90vh] bg-card rounded-t-3xl overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card z-10 px-6 pt-6 pb-3">
          <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{title}</h3>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          {/* Step 1: Select date & time */}
          {step === "select" && (
            <div className="space-y-5">
              {/* Property summary */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                <img src={property.image} alt={property.title} className="w-14 h-14 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{property.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {property.estate}, {property.county}
                  </p>
                </div>
              </div>

              {/* Select Date */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Select Date
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {dates.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setSelectedDate(d.value)}
                      className={`shrink-0 w-16 py-3 rounded-xl text-center transition-colors ${
                        selectedDate === d.value
                          ? "gradient-trust text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="text-[10px] font-medium">{d.label}</p>
                      <p className="text-xs font-semibold mt-0.5">{d.date}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Time */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Select Time
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        selectedTime === t
                          ? "gradient-trust text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional note */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Add a note (optional)</h4>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={isShortStay ? "e.g., Arriving with 2 guests, any parking?" : "e.g., I'd like to see both bedrooms and the parking area"}
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-20"
                />
              </div>

              <button
                onClick={() => selectedDate && selectedTime && setStep("confirm")}
                className={`w-full py-4 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform ${
                  selectedDate && selectedTime
                    ? "gradient-trust text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {selectedDate && selectedTime ? "Review Request" : "Select date & time"}
              </button>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === "confirm" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-trust/5 border border-trust/20">
                <h4 className="text-sm font-semibold text-trust mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {isShortStay ? "Booking" : "Viewing"} Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property</span>
                    <span className="font-medium text-right max-w-[60%] truncate">{property.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{property.estate}, {property.county}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{dates.find(d => d.value === selectedDate)?.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  {note && (
                    <div className="pt-2 border-t border-trust/10">
                      <span className="text-muted-foreground text-xs">Note:</span>
                      <p className="text-xs font-medium mt-0.5">{note}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info notice */}
              <div className="p-3 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-accent-foreground">How it works:</span> Your request will be sent to the landlord. Once they accept, their contact details (phone & chat) will be shared with you.
                </p>
              </div>

              <button
                onClick={() => setStep("pending")}
                className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-transform"
              >
                ✓ Send {isShortStay ? "Booking" : "Viewing"} Request
              </button>
              <button
                onClick={() => setStep("select")}
                className="w-full py-3 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground"
              >
                ← Go Back
              </button>
            </div>
          )}

          {/* Step 3: Pending — waiting for landlord */}
          {step === "pending" && (
            <div className="py-8 text-center space-y-5 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-1">Request Sent!</h4>
                <p className="text-sm text-muted-foreground">Waiting for the landlord to accept your {isShortStay ? "booking" : "viewing"} request…</p>
              </div>
              <div className="p-4 rounded-2xl bg-secondary">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{dates.find(d => d.value === selectedDate)?.date}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Average response time: {property.landlordResponseTime}
              </div>
            </div>
          )}

          {/* Step 4: Accepted — contacts revealed */}
          {step === "accepted" && (
            <div className="py-6 space-y-5 animate-fade-in">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-trust/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-trust" />
                </div>
                <h4 className="text-lg font-bold mb-1 text-trust">{isShortStay ? "Booking" : "Viewing"} Accepted! 🎉</h4>
                <p className="text-sm text-muted-foreground">The landlord has confirmed your request</p>
              </div>

              {/* Booking details */}
              <div className="p-4 rounded-2xl bg-trust/5 border border-trust/20">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property</span>
                    <span className="font-medium text-right max-w-[60%] truncate">{property.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{dates.find(d => d.value === selectedDate)?.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                </div>
              </div>

              {/* Contact revealed */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold text-primary">Landlord Contact Revealed</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">👤</div>
                      <div>
                        <p className="text-sm font-semibold">John Kamau</p>
                        <p className="text-xs text-muted-foreground">Verified Landlord</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <a
                      href="tel:+254712345678"
                      className="flex-1 py-3 rounded-xl bg-trust/10 text-sm font-semibold text-trust active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      +254 712 345 678
                    </a>
                    <button className="flex-1 py-3 rounded-xl bg-primary/10 text-sm font-semibold text-primary active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-transform"
              >
                Done
              </button>
            </div>
          )}

          {/* Step 5: Declined */}
          {step === "declined" && (
            <div className="py-8 text-center space-y-5 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-1">Request Declined</h4>
                <p className="text-sm text-muted-foreground">The landlord is unavailable at this time. Try a different date or property.</p>
              </div>
              <button
                onClick={() => { setStep("select"); setSelectedDate(""); setSelectedTime(""); }}
                className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-transform"
              >
                Try Another Time
              </button>
              <button onClick={onClose} className="w-full py-3 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingRequestModal;

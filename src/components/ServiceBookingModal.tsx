import { X, Calendar, Clock, MapPin, ChevronRight, MessageCircle } from "lucide-react";
import { useState } from "react";
import type { ServiceProvider } from "@/data/mockData";

interface ServiceBookingModalProps {
  provider: ServiceProvider;
  onClose: () => void;
  onChat: () => void;
}

const timeSlots = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const ServiceBookingModal = ({ provider, onClose, onChat }: ServiceBookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState<"details" | "confirm">("details");

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-KE", { weekday: "short" }),
      date: d.toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
      value: d.toISOString().split("T")[0],
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-h-[90vh] bg-card rounded-t-3xl overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-card z-10 px-6 pt-6 pb-3">
          <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Book {provider.name}</h3>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6">
          {step === "details" ? (
            <div className="space-y-5">
              {/* Provider summary */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                <span className="text-2xl">{provider.avatar}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{provider.name}</p>
                  <p className="text-xs text-muted-foreground">{provider.category} · {provider.price}</p>
                </div>
                <span className="text-xs font-medium text-trust">⭐ {provider.rating}</span>
              </div>

              {/* Select Date */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Select Date</h4>
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
                <h4 className="text-sm font-semibold mb-3">Select Time</h4>
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

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Describe the job</h4>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Need help moving 2BR apartment to Kilimani..."
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none h-24"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onChat}
                  className="flex-1 py-3.5 rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat First
                </button>
                <button
                  onClick={() => selectedDate && selectedTime && setStep("confirm")}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform ${
                    selectedDate && selectedTime
                      ? "gradient-trust text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-trust/5 border border-trust/20">
                <h4 className="text-sm font-semibold text-trust mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="font-medium">{provider.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{provider.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Cost</span>
                    <span className="font-semibold text-primary">{provider.price}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-transform"
              >
                ✓ Confirm Booking
              </button>
              <button
                onClick={() => setStep("details")}
                className="w-full py-3 rounded-xl bg-secondary text-sm font-medium text-secondary-foreground"
              >
                ← Go Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceBookingModal;

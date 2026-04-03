import { Star, Clock, MapPin, MessageCircle, Calendar } from "lucide-react";
import { useState } from "react";
import type { ServiceProvider } from "@/data/mockData";
import ServiceBookingModal from "./ServiceBookingModal";

interface ServiceCardProps {
  provider: ServiceProvider;
}

const ServiceCard = ({ provider }: ServiceCardProps) => {
  const [showBooking, setShowBooking] = useState(false);
  const tierClass =
    provider.tier === "Premium" ? "tier-badge-premium" :
    provider.tier === "Pro" ? "tier-badge-pro" : "tier-badge-basic";

  return (
    <>
      <div className="bg-card rounded-2xl card-shadow p-4 transition-all duration-300 hover:card-shadow-hover animate-fade-in relative">
        {provider.boosted && (
          <div className="absolute -top-2 right-4 px-2.5 py-0.5 rounded-full gradient-premium text-[10px] font-bold text-accent-foreground">
            ⚡ Boosted
          </div>
        )}

        <div className="flex gap-3">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-2xl shrink-0">
            {provider.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-foreground truncate">{provider.name}</h3>
              <span className={tierClass}>{provider.tier}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{provider.category}</p>
            {provider.price && (
              <p className="text-xs font-semibold text-primary mb-1">{provider.price}</p>
            )}

            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                <span className="text-xs font-semibold">{provider.rating}</span>
                <span className="text-[10px] text-muted-foreground">({provider.reviews})</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {provider.responseSpeed}
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <MapPin className="w-3 h-3" />
              {provider.areaServed}
              {provider.availability && (
                <span className="ml-auto text-[10px] font-medium text-trust">📅 {provider.availability}</span>
              )}
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-xl gradient-trust text-xs font-semibold text-primary-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />
                Chat
              </button>
              <button
                onClick={() => setShowBooking(true)}
                className="flex-1 py-2 rounded-xl bg-secondary text-xs font-semibold text-secondary-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                Book
              </button>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <ServiceBookingModal
          provider={provider}
          onClose={() => setShowBooking(false)}
          onChat={() => setShowBooking(false)}
        />
      )}
    </>
  );
};

export default ServiceCard;

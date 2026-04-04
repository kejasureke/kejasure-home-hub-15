import { ArrowLeft, Heart, Share2, ShieldCheck, MapPin, Clock, MessageCircle, Phone, ChevronRight, Star, Bed, Bath, X, Calendar, AlertTriangle, Flag, ShieldAlert } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/mockData";
import PremiumUnlockModal from "./PremiumUnlockModal";
import ShareListingSheet from "./ShareListingSheet";
import ReportListingModal from "./ReportListingModal";

interface ListingDetailProps {
  property: Property;
  onBack: () => void;
  liked?: boolean;
  onToggleLike?: () => void;
}

const ListingDetail = ({ property, onBack, liked = false, onToggleLike }: ListingDetailProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const formatPrice = (price: number) => new Intl.NumberFormat("en-KE").format(price);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-KE", { weekday: "short" }),
      date: d.toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
      value: d.toISOString().split("T")[0],
    };
  });

  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

  return (
    <div className="fixed inset-0 z-40 bg-background overflow-y-auto animate-slide-up">
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] bg-muted">
        <img src={property.images[currentImage]} alt={property.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-foreground/20" />

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            <button onClick={onToggleLike} className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
              <Heart className={`w-5 h-5 ${liked ? "fill-destructive text-destructive" : "text-foreground"}`} />
            </button>
            <button onClick={() => setShowShare(true)} className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Image counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium">
          {currentImage + 1}/{property.images.length}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, i) => (
            <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? "bg-card w-5" : "bg-card/50"}`} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5 pb-32">
        {/* Price & Title */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-foreground">KES {formatPrice(property.price)}</span>
            <span className="text-sm text-muted-foreground">{property.priceUnit}</span>
            {property.rating && (
              <div className="flex items-center gap-1 ml-auto px-2 py-1 rounded-lg bg-secondary">
                <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                <span className="text-xs font-semibold">{property.rating}</span>
                <span className="text-[10px] text-muted-foreground">({property.reviewCount})</span>
              </div>
            )}
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2">{property.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            {property.verified && (
              <div className="verified-badge">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Listing</span>
              </div>
            )}
            <div className="location-chip">
              <MapPin className="w-3 h-3" />
              {property.estate}, {property.county}
            </div>
            {property.hostTrustBadge && (
              <div className="px-2 py-0.5 rounded-full bg-gold/15 text-xs font-medium text-gold-foreground">
                🏆 Trusted Host
              </div>
            )}
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { icon: Bed, value: property.bedrooms.toString(), label: "Beds" },
            { icon: Bath, value: property.bathrooms.toString(), label: "Baths" },
            { icon: Clock, value: property.landlordResponseTime, label: "Response" },
            { icon: MapPin, value: property.size || "–", label: "Size" },
          ].map((spec) => (
            <div key={spec.label} className="text-center p-3 rounded-2xl bg-secondary">
              <spec.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
              <p className="text-xs font-semibold">{spec.value}</p>
              <p className="text-[10px] text-muted-foreground">{spec.label}</p>
            </div>
          ))}
        </div>

        {/* Quick details */}
        {property.type === "rental" && (
          <div className="mb-5 p-4 rounded-2xl bg-secondary space-y-2">
            {[
              { label: "Deposit", value: property.deposit ? `KES ${formatPrice(property.deposit)}` : "–" },
              { label: "Move-in Date", value: property.moveInDate || "–" },
              { label: "Furnished", value: property.furnished ? "Yes" : "No" },
              { label: "Pet Friendly", value: property.petFriendly ? "Yes 🐾" : "No" },
              { label: "Floor", value: property.floor || "–" },
              { label: "Year Built", value: property.yearBuilt?.toString() || "–" },
            ].map((d) => (
              <div key={d.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="mb-5">
          <h2 className="text-base font-semibold mb-2">About this property</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{property.description}</p>
        </div>

        {/* Amenities */}
        <div className="mb-5">
          <h2 className="text-base font-semibold mb-2">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((a) => (
              <span key={a} className="px-3 py-1.5 rounded-xl bg-secondary text-xs font-medium text-secondary-foreground">{a}</span>
            ))}
          </div>
        </div>

        {/* Stay Rules */}
        {property.stayRules && (
          <div className="mb-5">
            <h2 className="text-base font-semibold mb-2">Stay Rules</h2>
            <div className="flex flex-wrap gap-2">
              {property.stayRules.map((r) => (
                <span key={r} className="px-3 py-1.5 rounded-xl bg-destructive/5 text-xs font-medium text-destructive">{r}</span>
              ))}
            </div>
          </div>
        )}

        {/* Nearby */}
        <div className="mb-5">
          <h2 className="text-base font-semibold mb-2">Nearby Landmarks</h2>
          <div className="space-y-2">
            {property.nearbyLandmarks.map((l) => (
              <div key={l} className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Map placeholder */}
        <div className="mb-5 rounded-2xl bg-secondary h-40 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">Map preview — {property.estate}, {property.county}</p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="p-4 rounded-2xl bg-trust/5 border border-trust/20 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-trust" />
            <h3 className="text-sm font-semibold text-trust">Trust & Safety</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>✓ Landlord identity verified</li>
            <li>✓ Property photos verified</li>
            <li>✓ Last active: {property.lastActive}</li>
            <li>✓ Response time: {property.landlordResponseTime}</li>
            <li>✓ Response speed: {property.landlordResponseSpeed === "fast" ? "⚡ Fast responder" : property.landlordResponseSpeed === "moderate" ? "🕐 Moderate" : "🕓 May take time"}</li>
          </ul>
        </div>

        {/* Anti-Scam Banner */}
        <div className="p-3 rounded-2xl bg-accent/5 border border-accent/20 mb-4">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-accent-foreground mb-0.5">Stay Safe on KejaSure</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Never pay rent or deposits outside the app. All genuine landlords are verified with a <ShieldCheck className="w-3 h-3 inline text-trust" /> badge. Report suspicious activity immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Suspicious Profile Flag */}
        {!property.verified && (
          <div className="p-3 rounded-2xl bg-destructive/5 border border-destructive/20 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-destructive mb-0.5">Unverified Listing</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  This listing has not been verified by our team. Exercise extra caution and verify the property in person before making any commitments.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Report */}
        <button
          onClick={() => setShowReport(true)}
          className="flex items-center gap-2 text-xs text-destructive/70 py-2 hover:text-destructive transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          Report this listing
        </button>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass-surface border-t border-border safe-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            onClick={() => setShowBooking(true)}
            className="flex-1 py-3.5 rounded-xl gradient-trust text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98]"
          >
            {property.type === "shortstay" ? "Book Stay" : "Schedule Viewing"}
          </button>
          <button
            onClick={() => setShowUnlock(true)}
            className="py-3.5 px-5 rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground transition-all active:scale-[0.98]"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowUnlock(true)}
            className="py-3.5 px-5 rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Booking Bottom Sheet */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-end bg-foreground/30 backdrop-blur-sm" onClick={() => setShowBooking(false)}>
          <div className="w-full max-h-[85vh] bg-card rounded-t-3xl overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card z-10 p-6 pb-3">
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-bold">
                {property.type === "shortstay" ? "Book Your Stay" : "Schedule a Viewing"}
              </h3>
            </div>
            <div className="px-6 pb-6 space-y-5">
              {/* Date selector */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Select Date</h4>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {dates.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setSelectedDate(d.value)}
                      className={`shrink-0 w-16 py-3 rounded-xl text-center transition-colors ${
                        selectedDate === d.value ? "gradient-trust text-primary-foreground" : "bg-secondary"
                      }`}
                    >
                      <p className="text-[10px] font-medium">{d.label}</p>
                      <p className="text-xs font-semibold mt-0.5">{d.date}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time selector */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Select Time</h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        selectedTime === t ? "gradient-trust text-primary-foreground" : "bg-secondary"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {selectedDate && selectedTime && (
                <div className="p-4 rounded-2xl bg-trust/5 border border-trust/20 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-trust" />
                    <span className="text-sm font-semibold text-trust">Booking Summary</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property</span>
                      <span className="font-medium">{property.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">{dates.find((d) => d.value === selectedDate)?.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                className={`w-full py-4 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform ${
                  selectedDate && selectedTime
                    ? "gradient-trust text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {selectedDate && selectedTime ? "Confirm Booking" : "Select date & time"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnlock && <PremiumUnlockModal onClose={() => setShowUnlock(false)} />}
      {showShare && <ShareListingSheet property={property} onClose={() => setShowShare(false)} />}
      {showReport && <ReportListingModal listingTitle={property.title} listingId={property.id} onClose={() => setShowReport(false)} />}
    </div>
  );
};

export default ListingDetail;

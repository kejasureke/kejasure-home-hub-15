import { ArrowLeft, Heart, Share2, ShieldCheck, MapPin, Clock, MessageCircle, Phone, ChevronRight, Star, Bed, Bath, X, Calendar } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/data/mockData";
import PremiumUnlockModal from "./PremiumUnlockModal";

interface ListingDetailProps {
  property: Property;
  onBack: () => void;
}

const ListingDetail = ({ property, onBack }: ListingDetailProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-KE").format(price);

  return (
    <div className="fixed inset-0 z-40 bg-background overflow-y-auto animate-slide-up">
      {/* Image Carousel */}
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src={property.images[currentImage]}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-foreground/20" />

        {/* Nav buttons */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => setLiked(!liked)} className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
              <Heart className={`w-5 h-5 ${liked ? "fill-destructive text-destructive" : "text-foreground"}`} />
            </button>
            <button className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {property.images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? "bg-card w-5" : "bg-card/50"}`}
            />
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
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2">{property.title}</h1>
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Specs */}
        <div className="flex gap-4 mb-5 p-4 rounded-2xl bg-secondary">
          <div className="flex-1 text-center">
            <Bed className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-semibold">{property.bedrooms}</p>
            <p className="text-xs text-muted-foreground">Bedrooms</p>
          </div>
          <div className="flex-1 text-center">
            <Bath className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-semibold">{property.bathrooms}</p>
            <p className="text-xs text-muted-foreground">Bathrooms</p>
          </div>
          <div className="flex-1 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-sm font-semibold">{property.landlordResponseTime}</p>
            <p className="text-xs text-muted-foreground">Response</p>
          </div>
        </div>

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
              <span key={a} className="px-3 py-1.5 rounded-xl bg-secondary text-xs font-medium text-secondary-foreground">
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Stay Rules */}
        {property.stayRules && (
          <div className="mb-5">
            <h2 className="text-base font-semibold mb-2">Stay Rules</h2>
            <div className="flex flex-wrap gap-2">
              {property.stayRules.map((r) => (
                <span key={r} className="px-3 py-1.5 rounded-xl bg-destructive/5 text-xs font-medium text-destructive">
                  {r}
                </span>
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
            <p className="text-xs text-muted-foreground">Map preview</p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="p-4 rounded-2xl bg-trust/5 border border-trust/20 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-trust" />
            <h3 className="text-sm font-semibold text-trust">Trust & Safety</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>✓ Landlord identity verified</li>
            <li>✓ Property photos verified</li>
            <li>✓ Last active: {property.lastActive}</li>
            <li>✓ Response time: {property.landlordResponseTime}</li>
          </ul>
        </div>
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
          <div className="w-full bg-card rounded-t-3xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-4">
              {property.type === "shortstay" ? "Book Your Stay" : "Schedule a Viewing"}
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Select Date</p>
                  <p className="text-xs text-muted-foreground">Choose your preferred date</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Select Time</p>
                  <p className="text-xs text-muted-foreground">Available slots shown</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </div>
            </div>
            <button className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-transform">
              Confirm Booking
            </button>
          </div>
        </div>
      )}

      {showUnlock && <PremiumUnlockModal onClose={() => setShowUnlock(false)} />}
    </div>
  );
};

export default ListingDetail;

import { ArrowLeft, Heart, Share2, ShieldCheck, MapPin, Clock, MessageCircle, Phone, ChevronRight, Star, Bed, Bath, X, Calendar, AlertTriangle, Flag, ShieldAlert, CheckCircle2, ClipboardList, Video, Building2, Lock, GitCompare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import type { Property } from "@/data/mockData";
import HostCard from "./listing/HostCard";
import SimilarListingsRail from "./listing/SimilarListingsRail";
import FullscreenImageViewer from "./listing/FullscreenImageViewer";
import { neighborhoodProfiles } from "@/data/neighborhoodData";
import ShareListingSheet from "./ShareListingSheet";
import ReportListingModal from "./ReportListingModal";
import ReviewRatingFlow from "./ReviewRatingFlow";
import ScamWarningBadge from "./ScamWarningBadge";
import PriceAlertButton from "./PriceAlertButton";
import PriceDropBadge from "./PriceDropBadge";
import MoveInChecklist from "./MoveInChecklist";
import VideoTourPlayer from "./VideoTourPlayer";
import SmileIDBadge from "./SmileIDBadge";
import SwipeableImageGallery from "./SwipeableImageGallery";
import BookingRequestModal from "./BookingRequestModal";
import { getScamRiskScore } from "@/utils/scamDetection";

interface ListingDetailProps {
  property: Property;
  onBack: () => void;
  liked?: boolean;
  onToggleLike?: () => void;
  onCompareWith?: (property: Property) => void;
  onSelectProperty?: (property: Property) => void;
}

const ListingDetail = ({ property, onBack, liked = false, onToggleLike, onCompareWith, onSelectProperty }: ListingDetailProps) => {
  const { closing, triggerClose } = useOverlayClose(onBack);
  const [currentImage, setCurrentImage] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showMoveIn, setShowMoveIn] = useState(false);
  const [showVideoTour, setShowVideoTour] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [stickyHeader, setStickyHeader] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setStickyHeader(el.scrollTop > 240);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat("en-KE").format(price);
  const scamRisk = getScamRiskScore(property);
  const oldPrice = property.priceHistory?.[0]?.price;


  return (
    <div ref={scrollRef} className={`fixed inset-0 z-[60] bg-background overflow-y-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}>
      {/* Sticky compact header (appears after gallery) */}
      <div
        className={`fixed top-0 left-0 right-0 z-20 max-w-lg mx-auto glass-surface border-b border-border transition-all duration-200 ${
          stickyHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={triggerClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{property.title}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              KES {new Intl.NumberFormat("en-KE").format(property.price)} {property.priceUnit}
            </p>
          </div>
          <button onClick={onToggleLike} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Heart className={`w-4 h-4 ${liked ? "fill-destructive text-destructive" : "text-foreground"}`} />
          </button>
          <button onClick={() => setShowShare(true)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Share2 className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="relative aspect-[4/3] bg-muted">
        <SwipeableImageGallery
          images={property.images}
          alt={property.title}
          className="w-full h-full"
          controlledIndex={currentImage}
          onIndexChange={setCurrentImage}
          onImageClick={() => setShowFullscreen(true)}
          bottomOffsetClass="bottom-4"
        />

        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
          <button onClick={triggerClose} className="w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center">
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

        {property.videoTour && (
          <div className="absolute bottom-4 left-4 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); setShowVideoTour(true); }}
              className="px-3 py-1 rounded-full bg-primary/90 text-[10px] font-bold text-primary-foreground flex items-center gap-1"
            >
              <Video className="w-3 h-3" />
              Video Tour
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-5 pb-32">
        {/* Price & Title */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-foreground">KES {formatPrice(property.price)}</span>
            <span className="text-sm text-muted-foreground">{property.priceUnit}</span>
            {property.rating && (
              <button onClick={() => setShowReviews(true)} className="flex items-center gap-1 ml-auto px-2 py-1 rounded-lg bg-secondary active:scale-95 transition-transform">
                <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                <span className="text-xs font-semibold">{property.rating}</span>
                <span className="text-[10px] text-muted-foreground">({property.reviewCount})</span>
              </button>
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

          {/* Corporate badge */}
          {property.corporate && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary mt-2 w-fit">
              💼 Corporate / Expat Housing
            </div>
          )}
        </div>

        {/* Scam Risk Warning */}
        <ScamWarningBadge risk={scamRisk} />

        {/* Price Drop + Alert */}
        <div className="flex items-center gap-3 mb-4">
          {oldPrice && oldPrice > property.price && (
            <PriceDropBadge oldPrice={oldPrice} newPrice={property.price} />
          )}
          <PriceAlertButton propertyId={property.id} currentPrice={property.price} />
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

        {/* Neighborhood Intelligence Card */}
        {(() => {
          const hood = neighborhoodProfiles.find(n => n.estate === property.estate);
          if (!hood) return null;
          const formatP = (n: number) => `KES ${new Intl.NumberFormat("en-KE").format(n)}`;
          const scoreColor = (s: number) => s >= 8 ? "text-primary" : s >= 6 ? "text-accent" : "text-destructive";
          const scoreBg = (s: number) => s >= 8 ? "bg-primary" : s >= 6 ? "bg-accent" : "bg-destructive";
          return (
            <div className="mb-5 p-4 rounded-2xl bg-card card-shadow border border-border">
              <h2 className="text-base font-semibold mb-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                {hood.estate} Area Intelligence
              </h2>
              <p className="text-[10px] text-muted-foreground mb-3">Should I live here?</p>

              {/* Scores row */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: "Safety", score: hood.safetyRating },
                  { label: "Water", score: hood.waterReliability },
                  { label: "Power", score: hood.electricityReliability },
                  { label: "Walk", score: hood.walkabilityScore },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="relative w-10 h-10 mx-auto mb-1">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-secondary" />
                        <circle cx="18" cy="18" r="15" fill="none" strokeWidth="3" strokeDasharray={`${s.score * 9.42} 94.2`} strokeLinecap="round" className={scoreBg(s.score)} />
                      </svg>
                      <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${scoreColor(s.score)}`}>{s.score.toFixed(0)}</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="px-2.5 py-2 rounded-xl bg-secondary">
                  <p className="text-[9px] text-muted-foreground">Noise</p>
                  <p className="text-[11px] font-semibold">{hood.noiseLevel}</p>
                </div>
                <div className="px-2.5 py-2 rounded-xl bg-secondary">
                  <p className="text-[9px] text-muted-foreground">Nightlife</p>
                  <p className="text-[11px] font-semibold">{hood.nightlife}</p>
                </div>
                <div className="px-2.5 py-2 rounded-xl bg-secondary">
                  <p className="text-[9px] text-muted-foreground">Avg Rent (2BR)</p>
                  <p className="text-[11px] font-semibold">{formatP(hood.avgRent2BR)}/mo</p>
                </div>
                <div className="px-2.5 py-2 rounded-xl bg-secondary">
                  <p className="text-[9px] text-muted-foreground">Nearest Mall</p>
                  <p className="text-[11px] font-semibold truncate">{hood.nearestMall}</p>
                </div>
              </div>

              {/* Internet & Transport */}
              <div className="mb-2">
                <p className="text-[10px] font-semibold text-muted-foreground mb-1">📡 Internet</p>
                <div className="flex flex-wrap gap-1">
                  {hood.internetProviders.map(p => (
                    <span key={p} className="px-2 py-0.5 rounded-full bg-primary/5 text-[9px] font-medium text-primary">{p}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground mb-1">🚌 Transport</p>
                <div className="flex flex-wrap gap-1">
                  {hood.transportOptions.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-accent/5 text-[9px] font-medium text-accent-foreground">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Map placeholder */}
        <div className="mb-5 rounded-2xl bg-secondary h-40 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">Map preview — {property.estate}, {property.county}</p>
          </div>
        </div>

        {/* Host / Landlord Card */}
        <HostCard property={property} />

        {/* Smile ID Verified Badge */}
        {property.verified && (
          <div className="mb-4">
            <SmileIDBadge propertyId={property.id} imageCount={property.images?.length || 4} />
          </div>
        )}

        {/* Trust Indicators */}
        <div className="p-4 rounded-2xl bg-trust/5 border border-trust/20 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-trust" />
            <h3 className="text-sm font-semibold text-trust">Trust & Safety</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>✓ Landlord identity verified via Smile ID</li>
            <li>✓ Property photos verified</li>
            <li>✓ Last active: {property.lastActive}</li>
            <li>✓ Response time: {property.landlordResponseTime}</li>
            <li>✓ Response speed: {property.landlordResponseSpeed === "fast" ? "⚡ Fast responder" : property.landlordResponseSpeed === "moderate" ? "🕐 Moderate" : "🕓 May take time"}</li>
          </ul>
        </div>

        {/* Safety Banner */}
        <div className="p-3 rounded-2xl bg-accent/5 border border-accent/20 mb-4">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-accent-foreground mb-0.5">Stay Safe with KejaSure</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                KejaSure connects you with verified landlords and service providers. Always visit the property in person before making any payment or commitment. Report suspicious profiles immediately.
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

        {/* Move-In Checklist CTA */}
        {property.type === "rental" && (
          <button
            onClick={() => setShowMoveIn(true)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-accent/10 border border-accent/20 mb-4 active:scale-[0.98] transition-transform"
          >
            <ClipboardList className="w-6 h-6 text-accent" />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Move-In Checklist</p>
              <p className="text-[10px] text-muted-foreground">Movers, cleaners, internet & more — all in one place</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Compare with */}
        {onCompareWith && (
          <button
            onClick={() => onCompareWith(property)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20 mb-4 active:scale-[0.98] transition-transform"
          >
            <GitCompare className="w-6 h-6 text-primary" />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Compare with...</p>
              <p className="text-[10px] text-muted-foreground">Pick another listing to compare side by side</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
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

      {/* Bottom CTA — Book first, contacts after acceptance */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass-surface border-t border-border safe-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            onClick={() => setShowBooking(true)}
            className="flex-1 py-3.5 rounded-xl gradient-trust text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98]"
          >
            {property.type === "shortstay" ? "Book Stay" : "Request Viewing"}
          </button>
          <button
            className="py-3.5 px-5 rounded-xl bg-muted text-sm font-semibold text-muted-foreground flex items-center gap-1.5 cursor-not-allowed"
            title="Contact available after booking is accepted"
          >
            <Lock className="w-3.5 h-3.5" />
            Call
          </button>
          <button
            className="py-3.5 px-5 rounded-xl bg-muted text-sm font-semibold text-muted-foreground flex items-center gap-1.5 cursor-not-allowed"
            title="Contact available after booking is accepted"
          >
            <Lock className="w-3.5 h-3.5" />
            Chat
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          📋 Contacts are shared once your booking is accepted
        </p>
      </div>

      {/* Booking Request Modal */}
      {showBooking && (
        <BookingRequestModal
          property={property}
          onClose={() => setShowBooking(false)}
        />
      )}

      {showShare && <ShareListingSheet property={property} onClose={() => setShowShare(false)} />}
      {showReport && <ReportListingModal listingTitle={property.title} listingId={property.id} onClose={() => setShowReport(false)} />}
      {showReviews && <ReviewRatingFlow onClose={() => setShowReviews(false)} targetName="Landlord" targetType="landlord" listingTitle={property.title} />}
      {showMoveIn && <MoveInChecklist property={property} onBack={() => setShowMoveIn(false)} />}
      {showVideoTour && property.videoTour && (
        <VideoTourPlayer
          videoUrl={property.videoTour}
          title={property.title}
          onBack={() => setShowVideoTour(false)}
          rooms={property.videoTourRooms}
        />
      )}
    </div>
  );
};

export default ListingDetail;

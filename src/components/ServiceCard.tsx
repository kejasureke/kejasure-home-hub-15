import { Star, Clock, MapPin, MessageCircle, Calendar, ChevronDown, ChevronUp, Image, ArrowLeftRight } from "lucide-react";
import { useState } from "react";
import type { ServiceProvider } from "@/data/mockData";
import ServiceBookingModal from "./ServiceBookingModal";
import BeforeAfterSlider from "./BeforeAfterSlider";

interface ServiceCardProps {
  provider: ServiceProvider;
}

const ServiceCard = ({ provider }: ServiceCardProps) => {
  const [showBooking, setShowBooking] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const tierClass =
    provider.tier === "Premium" ? "tier-badge-premium" :
    provider.tier === "Pro" ? "tier-badge-pro" : "tier-badge-basic";

  const hasReviews = provider.recentReviews && provider.recentReviews.length > 0;
  const hasPortfolio = provider.portfolio && provider.portfolio.length > 0;

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

            {/* Recent reviews toggle */}
            {hasReviews && (
              <button
                onClick={() => setShowReviews(!showReviews)}
                className="flex items-center gap-1 text-[11px] font-medium text-primary mb-2 active:opacity-70"
              >
                {showReviews ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showReviews ? "Hide reviews" : `See ${provider.recentReviews!.length} recent review${provider.recentReviews!.length > 1 ? "s" : ""}`}
              </button>
            )}

            {showReviews && provider.recentReviews && (
              <div className="space-y-2 mb-3 animate-fade-in">
                {provider.recentReviews.map((review, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-secondary/60">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-foreground">{review.author}</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-2.5 h-2.5 ${s <= review.rating ? "fill-gold text-gold" : "text-muted-foreground/20"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{review.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Portfolio preview toggle */}
            {hasPortfolio && (
              <button
                onClick={() => { setShowPortfolio(!showPortfolio); setActiveProject(0); }}
                className="flex items-center gap-1 text-[11px] font-medium text-primary mb-2 active:opacity-70"
              >
                <Image className="w-3 h-3" />
                {showPortfolio ? "Hide portfolio" : `View ${provider.portfolio!.length} project${provider.portfolio!.length > 1 ? "s" : ""}`}
              </button>
            )}

            {showPortfolio && provider.portfolio && (
              <div className="mb-3 animate-fade-in">
                {provider.portfolio.length > 1 && (
                  <div className="flex gap-1.5 mb-2 overflow-x-auto scrollbar-hide">
                    {provider.portfolio.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveProject(i)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                          i === activeProject
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {p.beforeAfter && <ArrowLeftRight className="w-2.5 h-2.5" />}
                        {p.title}
                      </button>
                    ))}
                  </div>
                )}

                {(() => {
                  const project = provider.portfolio[activeProject];
                  if (!project) return null;
                  return (
                    <div>
                      {provider.portfolio.length <= 1 && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <p className="text-[10px] font-semibold text-foreground">{project.title}</p>
                          {project.beforeAfter && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">
                              <ArrowLeftRight className="w-2.5 h-2.5" />
                              Before/After
                            </span>
                          )}
                        </div>
                      )}
                      {project.beforeAfter ? (
                        <BeforeAfterSlider
                          beforeImage={project.beforeAfter.before}
                          afterImage={project.beforeAfter.after}
                          height="h-36"
                        />
                      ) : (
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide snap-x">
                          {project.photos.map((photo, i) => (
                            <img
                              key={i}
                              src={photo}
                              alt={`${project.title} ${i + 1}`}
                              className="w-28 h-20 rounded-lg object-cover snap-center shrink-0"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-service-chat", {
                    detail: {
                      name: provider.name,
                      role: provider.category,
                      avatar: provider.avatar,
                    },
                  }));
                }}
                className="flex-1 py-2 rounded-xl gradient-trust text-xs font-semibold text-primary-foreground active:scale-[0.98] transition-transform flex items-center justify-center gap-1"
              >
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

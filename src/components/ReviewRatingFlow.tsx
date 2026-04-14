import { useState } from "react";
import { ArrowLeft, Star, Camera, X, Send, ThumbsUp, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

interface ReviewRatingFlowProps {
  onClose: () => void;
  targetName?: string;
  targetType?: "landlord" | "agent" | "host" | "provider";
  listingTitle?: string;
}

type Tab = "write" | "reviews";

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  helpful: number;
  verified: boolean;
  photos?: string[];
}

const mockReviews: Review[] = [
  { id: "1", author: "Mary W.", rating: 5, text: "Amazing landlord! Very responsive and the house was exactly as described. Moved in within a week.", date: "2 days ago", helpful: 12, verified: true },
  { id: "2", author: "Peter K.", rating: 4, text: "Good experience overall. The property was clean and well-maintained. Minor delay in key handover but otherwise great.", date: "1 week ago", helpful: 8, verified: true },
  { id: "3", author: "Jane M.", rating: 3, text: "Average experience. Property was okay but some amenities listed were not available. Communication could be better.", date: "2 weeks ago", helpful: 5, verified: false },
  { id: "4", author: "David O.", rating: 5, text: "Superb host! The short stay was perfect. Clean, well-located, and the check-in process was seamless.", date: "3 weeks ago", helpful: 15, verified: true },
];

const ratingLabels = ["", "Terrible", "Poor", "Average", "Good", "Excellent"];

const ReviewRatingFlow = ({ onClose, targetName = "John Kamau", targetType = "landlord", listingTitle = "2BR Apartment, Kilimani" }: ReviewRatingFlowProps) => {
  const [tab, setTab] = useState<Tab>("reviews");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const avgRating = (mockReviews.reduce((a, r) => a + r.rating, 0) / mockReviews.length).toFixed(1);
  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: mockReviews.filter((rev) => rev.rating === r).length }));

  const filteredReviews = filterRating ? mockReviews.filter((r) => r.rating === filterRating) : mockReviews;

  const handleAddPhoto = () => {
    if (photos.length < 4) {
      setPhotos([...photos, `photo_${photos.length + 1}`]);
    }
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitted(true);
  };

  const toggleHelpful = (id: string) => {
    setHelpfulIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background overflow-y-auto animate-slide-up">
      <div className="sticky top-0 z-10 glass-surface border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold">Reviews & Ratings</h1>
            <p className="text-[10px] text-muted-foreground">{targetName} · {targetType}</p>
          </div>
        </div>
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {[
            { key: "reviews" as Tab, label: `Reviews (${mockReviews.length})` },
            { key: "write" as Tab, label: "Write Review" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t.key ? "bg-card card-shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 pb-20">
        {/* Reviews Tab */}
        {tab === "reviews" && (
          <div className="animate-fade-in">
            {/* Summary */}
            <div className="bg-card rounded-2xl card-shadow p-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-foreground">{avgRating}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(Number(avgRating)) ? "text-accent fill-accent" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{mockReviews.length} reviews</p>
                </div>
                <div className="flex-1 space-y-1">
                  {ratingDist.map((d) => (
                    <button key={d.rating} onClick={() => setFilterRating(filterRating === d.rating ? null : d.rating)} className="w-full flex items-center gap-2">
                      <span className="text-[10px] font-medium w-3 text-muted-foreground">{d.rating}</span>
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${filterRating === d.rating ? "bg-accent" : "bg-primary"}`} style={{ width: `${(d.count / mockReviews.length) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-4">{d.count}</span>
                    </button>
                  ))}
                </div>
              </div>
              {filterRating && (
                <button onClick={() => setFilterRating(null)} className="mt-3 text-xs text-primary font-medium">
                  Clear filter ({filterRating}★)
                </button>
              )}
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-card rounded-2xl card-shadow p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full gradient-trust flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">{review.author[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{review.author}</span>
                        {review.verified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "text-accent fill-accent" : "text-muted-foreground/20"}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {review.date}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{review.text}</p>
                  <button
                    onClick={() => toggleHelpful(review.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      helpfulIds.has(review.id) ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    Helpful ({review.helpful + (helpfulIds.has(review.id) ? 1 : 0)})
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Write Review Tab */}
        {tab === "write" && (
          <div className="animate-fade-in">
            {submitted ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-[pulse_1s_ease-in-out_2]">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-1">Review Submitted!</h3>
                <p className="text-sm text-muted-foreground text-center max-w-[260px] mb-4">
                  Thank you for your feedback. Your review helps other tenants make informed decisions.
                </p>
                <button onClick={onClose} className="px-8 py-3 rounded-xl gradient-trust text-sm font-bold text-primary-foreground">
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Rate your experience with</p>
                  <h3 className="text-base font-bold">{targetName}</h3>
                  <p className="text-xs text-muted-foreground">{listingTitle}</p>
                </div>

                {/* Star Rating */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="active:scale-90 transition-transform"
                      >
                        <Star className={`w-11 h-11 ${s <= (hoverRating || rating) ? "text-accent fill-accent" : "text-muted-foreground/20"}`} />
                      </button>
                    ))}
                  </div>
                  {(hoverRating || rating) > 0 && (
                    <p className="text-sm font-semibold text-accent-foreground">{ratingLabels[hoverRating || rating]}</p>
                  )}
                </div>

                {/* Review Text */}
                <div>
                  <label className="text-xs font-semibold mb-1.5 block">Your Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience... Was the listing accurate? How was the landlord's communication?"
                    className="w-full h-32 p-3 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    maxLength={500}
                  />
                  <p className="text-[10px] text-muted-foreground text-right mt-1">{reviewText.length}/500</p>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="text-xs font-semibold mb-1.5 block">Add Photos (optional)</label>
                  <div className="flex gap-2 flex-wrap">
                    {photos.map((_, i) => (
                      <div key={i} className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center relative">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <button onClick={() => setPhotos(photos.filter((__, idx) => idx !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                          <X className="w-3 h-3 text-destructive-foreground" />
                        </button>
                      </div>
                    ))}
                    {photos.length < 4 && (
                      <button onClick={handleAddPhoto} className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center active:scale-95 transition-transform">
                        <Camera className="w-5 h-5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Up to 4 photos</p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={rating === 0}
                  className="w-full py-4 rounded-xl gradient-trust text-sm font-bold text-primary-foreground active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Review
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewRatingFlow;
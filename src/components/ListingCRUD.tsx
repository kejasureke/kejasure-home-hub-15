import { useState } from "react";
import {
  ArrowLeft, ArrowRight, Camera, Video, X, Check, Zap, MapPin,
  Home, Bed, Bath, DollarSign, FileText, Star, Sparkles, Trash2, Edit3, Image
} from "lucide-react";
import AIPhotoVerification from "./AIPhotoVerification";
import { kenyaCounties } from "@/data/kenyaCounties";

type ListingType = "rental" | "shortstay" | "service";

interface ListingCRUDProps {
  type: ListingType;
  onClose: () => void;
  editData?: Partial<ListingFormData>;
}

interface ListingFormData {
  title: string;
  description: string;
  type: "rental" | "shortstay" | "service";
  price: string;
  priceUnit: string;
  bedrooms: number;
  bathrooms: number;
  county: string;
  subcounty: string;
  estate: string;
  amenities: string[];
  photos: string[];
  videoUrl: string;
  furnished: boolean;
  petFriendly: boolean;
  deposit: string;
  moveInDate: string;
  size: string;
  floor: string;
  featured: boolean;
  boostDays: number;
  // Service-specific
  serviceCategory: string;
  availability: string;
}

const defaultForm: ListingFormData = {
  title: "", description: "", type: "rental", price: "", priceUnit: "/mo",
  bedrooms: 1, bathrooms: 1, county: "", subcounty: "", estate: "",
  amenities: [], photos: [], videoUrl: "", furnished: false, petFriendly: false,
  deposit: "", moveInDate: "", size: "", floor: "", featured: false, boostDays: 0,
  serviceCategory: "", availability: "",
};

const rentalAmenities = [
  "Parking", "Swimming Pool", "Gym", "Security", "CCTV", "Elevator",
  "Backup Generator", "Borehole", "Water Tank", "Fiber Internet",
  "Balcony", "Garden", "Rooftop Terrace", "Servant Quarter", "Smart Home",
  "AC", "Solar Panels", "Playground", "Laundry Room", "Pet Area",
];

const stayAmenities = [
  "WiFi", "Smart TV", "Kitchen", "Workspace", "Parking", "Pool",
  "AC", "Washing Machine", "BBQ Area", "Ocean View", "City View",
  "Jacuzzi", "Concierge", "Beach Access", "Gym", "Self Check-in",
];

const serviceCategories = [
  "Movers", "Cleaners", "Electricians", "Plumbers", "Internet Installers",
  "Security", "Painters", "Carpenters", "Landscapers", "Pest Control",
  "Interior Design", "Fumigation",
];

const boostOptions = [
  { days: 3, price: 300, label: "3 Days" },
  { days: 7, price: 500, label: "1 Week", popular: true },
  { days: 14, price: 800, label: "2 Weeks" },
  { days: 30, price: 1200, label: "1 Month" },
];

const steps = ["Details", "Location", "Amenities", "Photos", "Boost"];

const ListingCRUD = ({ type, onClose, editData }: ListingCRUDProps) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ListingFormData>({
    ...defaultForm,
    type: type === "service" ? "rental" : type,
    priceUnit: type === "shortstay" ? "/night" : "/mo",
    ...editData,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const update = (partial: Partial<ListingFormData>) => setForm((f) => ({ ...f, ...partial }));

  const selectedCounty = kenyaCounties.find((c) => c.name === form.county);
  const amenitiesList = type === "shortstay" ? stayAmenities : rentalAmenities;

  const toggleAmenity = (a: string) => {
    update({
      amenities: form.amenities.includes(a)
        ? form.amenities.filter((x) => x !== a)
        : [...form.amenities, a],
    });
  };

  const addFakePhoto = () => {
    const placeholders = [
      "🏠", "🏡", "🏢", "🏘️", "🛋️", "🛏️", "🍳", "🚿",
    ];
    if (form.photos.length < 10) {
      update({ photos: [...form.photos, placeholders[form.photos.length % placeholders.length]] });
    }
  };

  const removePhoto = (i: number) => {
    update({ photos: form.photos.filter((_, idx) => idx !== i) });
  };

  const handleSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-trust/10 flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-trust" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {editData ? "Listing Updated!" : "Listing Published!"}
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          {form.featured
            ? "Your listing is live and boosted for extra visibility."
            : "Your listing is now live and visible to tenants."}
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-bold text-foreground">
            {editData ? "Edit Listing" : type === "service" ? "Add Service" : "New Listing"}
          </h1>
          <div className="w-6" />
        </div>
        {/* Progress */}
        <div className="flex gap-1.5">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full h-1 rounded-full transition-all ${
                i <= step ? "bg-primary" : "bg-muted"
              }`} />
              <span className={`text-[9px] font-medium ${
                i <= step ? "text-primary" : "text-muted-foreground"
              }`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 pb-32">
        {/* Step 1: Details */}
        {step === 0 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold">Basic Details</h2>

            {type === "service" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Service Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {serviceCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => update({ serviceCategory: cat })}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                        form.serviceCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-card card-shadow text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {type !== "service" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Listing Type</label>
                <div className="flex gap-2">
                  {(["rental", "shortstay"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => update({ type: t, priceUnit: t === "shortstay" ? "/night" : "/mo" })}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                        form.type === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-card card-shadow text-foreground"
                      }`}
                    >
                      {t === "rental" ? "🏠 Rental" : "🌙 Short Stay"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Title</label>
              <input
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder={type === "service" ? "e.g. Professional House Cleaning" : "e.g. Spacious 2BR in Kilimani"}
                className="w-full px-3 py-2.5 rounded-xl bg-card card-shadow text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                rows={3}
                placeholder="Describe your listing..."
                className="w-full px-3 py-2.5 rounded-xl bg-card card-shadow text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Price (KES)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => update({ price: e.target.value })}
                  placeholder="e.g. 45000"
                  className="w-full px-3 py-2.5 rounded-xl bg-card card-shadow text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {type !== "service" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Deposit (KES)</label>
                  <input
                    type="number"
                    value={form.deposit}
                    onChange={(e) => update({ deposit: e.target.value })}
                    placeholder="e.g. 45000"
                    className="w-full px-3 py-2.5 rounded-xl bg-card card-shadow text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}
            </div>

            {type !== "service" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Bedrooms</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => update({ bedrooms: Math.max(0, form.bedrooms - 1) })} className="w-8 h-8 rounded-lg bg-card card-shadow flex items-center justify-center text-foreground font-bold">-</button>
                      <span className="text-lg font-bold text-foreground">{form.bedrooms}</span>
                      <button onClick={() => update({ bedrooms: form.bedrooms + 1 })} className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Bathrooms</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => update({ bathrooms: Math.max(0, form.bathrooms - 1) })} className="w-8 h-8 rounded-lg bg-card card-shadow flex items-center justify-center text-foreground font-bold">-</button>
                      <span className="text-lg font-bold text-foreground">{form.bathrooms}</span>
                      <button onClick={() => update({ bathrooms: form.bathrooms + 1 })} className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">+</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Size (sqm)</label>
                    <input
                      value={form.size}
                      onChange={(e) => update({ size: e.target.value })}
                      placeholder="e.g. 85"
                      className="w-full px-3 py-2.5 rounded-xl bg-card card-shadow text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Floor</label>
                    <input
                      value={form.floor}
                      onChange={(e) => update({ floor: e.target.value })}
                      placeholder="e.g. 3rd"
                      className="w-full px-3 py-2.5 rounded-xl bg-card card-shadow text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => update({ furnished: !form.furnished })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      form.furnished ? "bg-primary text-primary-foreground" : "bg-card card-shadow text-foreground"
                    }`}
                  >
                    {form.furnished && <Check className="w-3.5 h-3.5" />} Furnished
                  </button>
                  <button
                    onClick={() => update({ petFriendly: !form.petFriendly })}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      form.petFriendly ? "bg-primary text-primary-foreground" : "bg-card card-shadow text-foreground"
                    }`}
                  >
                    {form.petFriendly && <Check className="w-3.5 h-3.5" />} Pet Friendly
                  </button>
                </div>
              </>
            )}

            {type === "service" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Availability</label>
                <input
                  value={form.availability}
                  onChange={(e) => update({ availability: e.target.value })}
                  placeholder="e.g. Same day, Next day"
                  className="w-full px-3 py-2.5 rounded-xl bg-card card-shadow text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Location */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Location
            </h2>
            <p className="text-xs text-muted-foreground">Select county, then choose the specific estate/area.</p>

            {/* County Selection */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">County</label>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {kenyaCounties.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => update({ county: c.name, estate: "" })}
                    className={`py-2 px-2 rounded-xl text-xs font-medium transition-all text-left ${
                      form.county === c.name
                        ? "bg-primary text-primary-foreground"
                        : "bg-card card-shadow text-foreground"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Estate Selection */}
            {selectedCounty && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  Estate / Area in {form.county}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCounty.estates.map((e) => (
                    <button
                      key={e}
                      onClick={() => update({ estate: e })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-all ${
                        form.estate === e
                          ? "bg-primary text-primary-foreground"
                          : "bg-card card-shadow text-foreground"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.county && form.estate && (
              <div className="p-3 rounded-xl bg-trust/10 border border-trust/20">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-trust" />
                  <span className="text-sm font-semibold text-trust">{form.estate}, {form.county}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Amenities */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold">
              {type === "service" ? "Service Features" : "Amenities & Features"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Select all that apply. ({form.amenities.length} selected)
            </p>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                    form.amenities.includes(a)
                      ? "bg-primary text-primary-foreground"
                      : "bg-card card-shadow text-foreground"
                  }`}
                >
                  {form.amenities.includes(a) && "✓ "}{a}
                </button>
              ))}
            </div>

            {/* Custom amenity */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Add Custom</label>
              <div className="flex gap-2">
                <input
                  id="custom-amenity"
                  placeholder="e.g. Wine Cellar"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-card card-shadow text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const input = e.currentTarget;
                      if (input.value.trim()) {
                        toggleAmenity(input.value.trim());
                        input.value = "";
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById("custom-amenity") as HTMLInputElement;
                    if (input?.value.trim()) {
                      toggleAmenity(input.value.trim());
                      input.value = "";
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Photos & Video */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" /> Photos & Video
            </h2>
            <p className="text-xs text-muted-foreground">Add up to 10 photos. First photo is the cover.</p>

            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-2">
              {form.photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-xl bg-card card-shadow flex items-center justify-center border-2 border-transparent">
                  <span className="text-3xl">{p}</span>
                  {i === 0 && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[8px] font-bold">
                      COVER
                    </div>
                  )}
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {form.photos.length < 10 && (
                <button
                  onClick={addFakePhoto}
                  className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                >
                  <Camera className="w-6 h-6 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Add Photo</span>
                </button>
              )}
            </div>

            {/* Video */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Video Tour (optional)</label>
              <button
                onClick={() => update({ videoUrl: form.videoUrl ? "" : "video_placeholder.mp4" })}
                className={`w-full p-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${
                  form.videoUrl
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/30"
                }`}
              >
                <Video className={`w-6 h-6 ${form.videoUrl ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${form.videoUrl ? "text-primary" : "text-muted-foreground"}`}>
                  {form.videoUrl ? "✓ Video added" : "Upload a video tour"}
                </span>
              </button>
            </div>

            {/* AI Photo Verification */}
            {form.photos.length >= 1 && (
              <AIPhotoVerification mode="listing" />
            )}

            <div className="p-3 rounded-xl bg-accent/10">
              <p className="text-xs text-muted-foreground">
                💡 <span className="font-semibold">Tip:</span> Listings with 5+ photos get 3x more views. Video tours get 2x more leads.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Featured Boost */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Featured Boost
            </h2>
            <p className="text-xs text-muted-foreground">Boost your listing to appear first in search results.</p>

            <div className="space-y-3">
              {/* No boost option */}
              <button
                onClick={() => update({ featured: false, boostDays: 0 })}
                className={`w-full p-4 rounded-2xl text-left transition-all ${
                  !form.featured
                    ? "bg-card border-2 border-primary card-shadow"
                    : "bg-card card-shadow"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">No Boost</p>
                    <p className="text-xs text-muted-foreground">Standard listing visibility</p>
                  </div>
                  <span className="text-sm font-bold text-trust">Free</span>
                </div>
              </button>

              {/* Boost options */}
              {boostOptions.map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => update({ featured: true, boostDays: opt.days })}
                  className={`w-full p-4 rounded-2xl text-left transition-all relative ${
                    form.featured && form.boostDays === opt.days
                      ? "bg-card border-2 border-accent card-shadow"
                      : "bg-card card-shadow"
                  }`}
                >
                  {opt.popular && (
                    <div className="absolute -top-2 right-3 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[9px] font-bold">
                      POPULAR
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{opt.label} Boost</p>
                        <p className="text-xs text-muted-foreground">Featured badge + top placement</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-accent">KES {opt.price}</span>
                  </div>
                </button>
              ))}
            </div>

            {form.featured && (
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                <p className="text-xs text-foreground font-medium">
                  ⚡ Your listing will appear at the top of search results for {form.boostDays} days with a Featured badge.
                </p>
              </div>
            )}

            {/* Preview Summary */}
            <div className="mt-4">
              <h3 className="text-sm font-bold mb-3">Listing Summary</h3>
              <div className="bg-card rounded-2xl card-shadow p-4 space-y-2">
                {form.title && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Title</span>
                    <span className="font-semibold text-foreground truncate max-w-[60%] text-right">{form.title}</span>
                  </div>
                )}
                {form.county && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-semibold text-foreground">{form.estate}, {form.county}</span>
                  </div>
                )}
                {form.price && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold text-foreground">KES {Number(form.price).toLocaleString()}{form.priceUnit}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Photos</span>
                  <span className="font-semibold text-foreground">{form.photos.length} photos{form.videoUrl ? " + video" : ""}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Amenities</span>
                  <span className="font-semibold text-foreground">{form.amenities.length} selected</span>
                </div>
                {form.featured && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Boost</span>
                    <span className="font-semibold text-accent">{form.boostDays} days</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex gap-3 z-10">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 rounded-xl bg-card card-shadow text-sm font-bold text-foreground flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl bg-trust text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Check className="w-4 h-4" /> {editData ? "Update Listing" : "Publish Listing"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCRUD;

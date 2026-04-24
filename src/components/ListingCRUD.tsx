import { useState, useEffect } from "react";
import {
  ArrowLeft, ArrowRight, Camera, Video, X, Check, Zap, MapPin,
  Home, Bed, Bath, DollarSign, FileText, Star, Sparkles, Trash2, Edit3, Image, Wand2
} from "lucide-react";
import AIPhotoVerification from "./AIPhotoVerification";
import { kenyaCounties } from "@/data/kenyaCounties";

type ListingType = "rental" | "shortstay" | "service" | "commercial";

interface ListingCRUDProps {
  type: ListingType;
  onClose: () => void;
  editData?: Partial<ListingFormData>;
}

interface ListingFormData {
  title: string;
  description: string;
  type: "rental" | "shortstay" | "commercial" | "service";
  commercialType: string;
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
  sizeSqft: string;
  floor: string;
  featured: boolean;
  boostDays: number;
  // Service-specific
  serviceCategory: string;
  availability: string;
}

const commercialTypes = [
  { value: "shop", label: "🏪 Shop/Retail", desc: "Retail store, boutique, duka" },
  { value: "office", label: "🏢 Office", desc: "Office suite, co-working" },
  { value: "godown", label: "🏭 Godown/Warehouse", desc: "Storage, distribution" },
  { value: "showroom", label: "🏬 Showroom", desc: "Display, gallery space" },
];

const defaultForm: ListingFormData = {
  title: "", description: "", type: "rental", commercialType: "", price: "", priceUnit: "/mo",
  bedrooms: 1, bathrooms: 1, county: "", subcounty: "", estate: "",
  amenities: [], photos: [], videoUrl: "", furnished: false, petFriendly: false,
  deposit: "", moveInDate: "", size: "", sizeSqft: "", floor: "", featured: false, boostDays: 0,
  serviceCategory: "", availability: "",
};

const rentalAmenities = [
  // Internet & Connectivity
  "WiFi (Safaricom)", "WiFi (Airtel/Faiba)", "Fiber Internet", "Starlink",
  // Security
  "24hr Security Guard", "CCTV", "Electric Fence", "Perimeter Wall", "Intercom", "Alarm System",
  // Water & Power
  "Borehole", "Water Tank", "Backup Generator", "Solar Panels", "Prepaid Meter",
  // Facilities
  "Parking", "Swimming Pool", "Gym", "Elevator", "Rooftop Terrace", "Garden",
  "Playground", "Laundry Room", "BBQ Area", "Servant Quarter",
  // Unit Features
  "Balcony", "AC", "Hot Shower", "Bathtub", "Walk-in Closet", "Smart Home",
  "Tiled Floors", "Wooden Floors", "DSQ", "Store Room",
  // Pet & Misc
  "Pet Area", "Wheelchair Access", "Garbage Collection",
];

const stayAmenities = [
  "WiFi (Safaricom)", "WiFi (Airtel/Faiba)", "Starlink",
  "Smart TV", "Netflix/DSTV", "Kitchen", "Workspace", "Parking",
  "Swimming Pool", "AC", "Washing Machine", "BBQ Area",
  "Ocean View", "City View", "Mountain View",
  "Jacuzzi", "Concierge", "Beach Access", "Gym", "Self Check-in",
  "Hot Shower", "Iron & Board", "Coffee Machine", "Balcony",
  "24hr Security Guard", "CCTV", "Backup Generator",
];

const commercialAmenities = [
  // Connectivity
  "Fiber Internet", "WiFi (Safaricom)", "WiFi (Airtel/Faiba)",
  // Security
  "24hr Security Guard", "CCTV", "Alarm System", "Electric Fence",
  // Power & Water
  "Backup Generator", "Solar Panels", "Borehole", "Water Tank", "3-Phase Power",
  // Facilities
  "Parking", "Loading Bay", "Elevator/Goods Lift", "Warehouse Space",
  "Reception Area", "Meeting Room", "Kitchen/Pantry", "Washrooms",
  // Features
  "Street Frontage", "High Foot Traffic", "Ground Floor", "Corner Unit",
  "Signage Space", "AC/HVAC", "Fire Safety System", "Wheelchair Access",
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
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDraft, setAiDraft] = useState("");
  const [aiTone, setAiTone] = useState<"friendly" | "professional" | "luxury">("friendly");
  const [photoCaptions, setPhotoCaptions] = useState<Record<number, string>>({});
  const [captionsGenerating, setCaptionsGenerating] = useState(false);
  const [editingCaption, setEditingCaption] = useState<number | null>(null);
  const [activeSuggestPhoto, setActiveSuggestPhoto] = useState<number | null>(null);
  const [savedFlash, setSavedFlash] = useState<number | null>(null);
  const [polishEnabled, setPolishEnabled] = useState(true);
  const [polishCandidate, setPolishCandidate] = useState<{ idx: number; original: string; polished: string } | null>(null);
  const [captionErrors, setCaptionErrors] = useState<Record<number, string>>({});

  const update = (partial: Partial<ListingFormData>) => setForm((f) => ({ ...f, ...partial }));

  const generateKejaAIDescription = () => {
    setAiGenerating(true);
    setAiDraft("");
    const beds = form.bedrooms;
    const baths = form.bathrooms;
    const loc = [form.estate, form.subcounty, form.county].filter(Boolean).join(", ") || "a prime Kenyan neighborhood";
    const topAmenities = form.amenities.slice(0, 5);
    const isStay = form.type === "shortstay";
    const isCommercial = form.type === "commercial";
    const isService = type === "service";

    const intros = {
      friendly: isService
        ? `Looking for reliable ${form.serviceCategory || "home"} services? You're in the right place! 🛠️`
        : isStay
          ? `Welcome to your perfect getaway in ${loc}! ✨`
          : isCommercial
            ? `Premium ${form.commercialType || "commercial"} space available in ${loc}. 🏢`
            : `Welcome home! This lovely ${beds}-bedroom unit in ${loc} is ready for you. 🏡`,
      professional: isService
        ? `Professional ${form.serviceCategory || ""} services delivered with care, precision, and accountability.`
        : isStay
          ? `Thoughtfully appointed short-stay accommodation situated in ${loc}, ideal for business and leisure travelers.`
          : isCommercial
            ? `Strategically located ${form.commercialType || "commercial"} premises in ${loc}, suited for established and growing businesses.`
            : `A well-maintained ${beds}-bedroom, ${baths}-bathroom property situated in ${loc}, offered by a verified provider.`,
      luxury: isService
        ? `Experience white-glove ${form.serviceCategory || "home"} service tailored to discerning clients.`
        : isStay
          ? `Indulge in an elevated stay at this signature residence in ${loc} — where every detail is considered.`
          : isCommercial
            ? `An exceptional ${form.commercialType || "commercial"} address in ${loc}, designed for prestige and performance.`
            : `Discover refined ${beds}-bedroom living in ${loc} — a sanctuary of comfort, light, and timeless design.`,
    };

    const features: string[] = [];
    if (!isService && !isCommercial) {
      features.push(`${beds} spacious bedroom${beds === 1 ? "" : "s"}`);
      features.push(`${baths} modern bathroom${baths === 1 ? "" : "s"}`);
      if (form.size) features.push(`approximately ${form.size} sqm of living space`);
      if (form.floor) features.push(`located on the ${form.floor} floor`);
      if (form.furnished) features.push("fully furnished and move-in ready");
      if (form.petFriendly) features.push("pet-friendly environment");
    }
    if (isCommercial) {
      if (form.sizeSqft) features.push(`${form.sizeSqft} sqft of usable space`);
      if (form.floor) features.push(`positioned on the ${form.floor} floor`);
    }

    const amenitiesText = topAmenities.length
      ? `Highlights include ${topAmenities.join(", ")}${form.amenities.length > 5 ? `, and ${form.amenities.length - 5} more` : ""}.`
      : "";

    const captionList = Object.entries(photoCaptions)
      .map(([k, v]) => ({ idx: Number(k), text: (v || "").trim() }))
      .filter((c) => c.text)
      .sort((a, b) => a.idx - b.idx)
      .map((c) => c.text.replace(/^Cover photo\s*[—-]\s*/i, ""));

    const photosLine = captionList.length
      ? `Photo highlights: ${captionList.slice(0, 5).join("; ")}${captionList.length > 5 ? `, and more.` : "."}`
      : form.photos.length
        ? `Browse the ${form.photos.length} photo${form.photos.length === 1 ? "" : "s"} above to see the space for yourself.`
        : "";

    const closing = {
      friendly: "Message us today — we'd love to show you around! 💬",
      professional: "Schedule a viewing at your convenience. Verified provider on Keja.",
      luxury: "Private viewings available by appointment.",
    }[aiTone];

    const parts = [
      intros[aiTone],
      features.length ? `It offers ${features.join(", ")}.` : "",
      amenitiesText,
      photosLine,
      closing,
    ].filter(Boolean);

    const fullText = parts.join(" ");

    // Stream the text in chunks for a polished AI feel
    let i = 0;
    const stepSize = 3;
    const interval = setInterval(() => {
      i += stepSize;
      setAiDraft(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
        setAiGenerating(false);
      }
    }, 20);
  };

  const applyAIDraft = () => {
    update({ description: aiDraft });
    setAiDraft("");
  };

  const selectedCounty = kenyaCounties.find((c) => c.name === form.county);
  const amenitiesList = form.type === "commercial" ? commercialAmenities : form.type === "shortstay" ? stayAmenities : rentalAmenities;

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
    // Re-key captions so indexes stay aligned with the photo array
    setPhotoCaptions((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const idx = Number(k);
        if (idx === i) return;
        next[idx > i ? idx - 1 : idx] = v;
      });
      return next;
    });
    setEditingCaption(null);
  };

  // Map placeholder emojis to plausible room/scene captions, biased by listing context
  const captionPoolFor = (emoji: string): string[] => {
    const isStay = form.type === "shortstay";
    const isCommercial = form.type === "commercial";
    switch (emoji) {
      case "🏠":
      case "🏡":
        return isCommercial
          ? ["Building exterior and street frontage", "Front view of the premises"]
          : ["Front exterior of the property", "Street-facing view of the home"];
      case "🏢":
        return ["Building façade and main entrance", "Exterior view of the block"];
      case "🏘️":
        return ["Compound and surrounding units", "View of the wider estate"];
      case "🛋️":
        return isStay
          ? ["Cosy living area with seating", "Lounge styled for guests"]
          : ["Spacious living room with natural light", "Open lounge area"];
      case "🛏️":
        return isStay
          ? ["Master bedroom with fresh linens", "Comfortable guest bedroom"]
          : ["Master bedroom with built-in storage", "Bright bedroom with large window"];
      case "🍳":
        return ["Modern fitted kitchen", "Kitchen with ample counter space"];
      case "🚿":
        return ["Bathroom with hot shower", "Clean, well-finished bathroom"];
      default:
        return ["Interior view of the property", "Detail shot from the listing"];
    }
  };

  const generateCaptions = () => {
    if (form.photos.length === 0) return;
    setCaptionsGenerating(true);
    setPhotoCaptions({});
    const total = form.photos.length;
    let i = 0;
    const tick = () => {
      if (i >= total) {
        setCaptionsGenerating(false);
        return;
      }
      const idx = i;
      const pool = captionPoolFor(form.photos[idx]);
      const caption = idx === 0
        ? `Cover photo — ${pool[0]}`
        : pool[idx % pool.length];
      setPhotoCaptions((prev) => ({ ...prev, [idx]: caption }));
      i += 1;
      setTimeout(tick, 220);
    };
    tick();
  };

  // Centralised safety check for any caption write path.
  // Blocks phone numbers, emails, and pricing — even when the user types it themselves
  // or chooses an unpolished suggestion.
  const validateCaption = (text: string): { ok: true } | { ok: false; reason: string } => {
    const t = (text || "").trim();
    if (!t) return { ok: true };
    if (t.length > 120) return { ok: false, reason: "Keep captions under 120 characters." };
    // Phone numbers: Kenyan formats and generic 7+ digit runs
    if (/\b(?:\+?254|0)[17]\d{8}\b/.test(t) || /(?:\d[\s-]?){7,}/.test(t)) {
      return { ok: false, reason: "Remove phone numbers — keep contact in chat." };
    }
    // Emails
    if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(t)) {
      return { ok: false, reason: "Remove email addresses — keep contact in chat." };
    }
    // Pricing: KES/Ksh/Sh + amount, currency symbols, or per-month/per-night phrasing
    if (/\b(?:KES|Ksh|KSh|Sh|USD|EUR|GBP)\.?\s?\d/i.test(t) || /[$€£]\s?\d/.test(t)) {
      return { ok: false, reason: "Remove pricing — it belongs in the price field." };
    }
    if (/\b\d[\d,]{2,}\s*(?:\/-|bob|shillings?|per\s?(?:month|night|day|week))\b/i.test(t)) {
      return { ok: false, reason: "Remove pricing — it belongs in the price field." };
    }
    return { ok: true };
  };

  const updateCaption = (idx: number, value: string) => {
    setPhotoCaptions((prev) => ({ ...prev, [idx]: value }));
    const check = validateCaption(value);
    setCaptionErrors((prev) => {
      const next = { ...prev };
      if (check.ok) delete next[idx];
      else next[idx] = check.reason;
      return next;
    });
  };

  const tryCommitEdit = (idx: number) => {
    const check = validateCaption(photoCaptions[idx] || "");
    if (!check.ok) {
      setCaptionErrors((prev) => ({ ...prev, [idx]: check.reason }));
      return false;
    }
    setCaptionErrors((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
    setEditingCaption(null);
    return true;
  };

  const suggestionsFor = (idx: number): string[] => {
    if (!form.photos[idx]) return [];
    const pool = captionPoolFor(form.photos[idx]);
    const extras = ["Newly renovated and freshly cleaned", "Bright space with great natural light"];
    const base = idx === 0 ? [`Cover photo — ${pool[0]}`, ...pool.slice(1)] : pool;
    // De-duplicate while preserving order
    return Array.from(new Set([...base, ...extras])).slice(0, 4);
  };

  const goToNextUncaptioned = (fromIdx: number) => {
    for (let j = fromIdx + 1; j < form.photos.length; j += 1) {
      if (!photoCaptions[j] || !photoCaptions[j].trim()) {
        setActiveSuggestPhoto(j);
        return;
      }
    }
    // Wrap to earlier photos still missing a caption
    for (let j = 0; j < fromIdx; j += 1) {
      if (!photoCaptions[j] || !photoCaptions[j].trim()) {
        setActiveSuggestPhoto(j);
        return;
      }
    }
    setActiveSuggestPhoto(null);
  };

  // Build a safer, more engaging variant of a caption.
  // - Strips contact info / prices (safety)
  // - Adds a sensory or trust adjective when missing
  // - Caps at ~80 chars and trims trailing punctuation
  const polishCaption = (idx: number, text: string): string => {
    let t = text.trim();
    // Safety: remove phone numbers, emails, and explicit KES amounts
    t = t.replace(/\b(?:\+?254|0)[17]\d{8}\b/g, "");
    t = t.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "");
    t = t.replace(/\b(?:KES|Ksh|KSh|Sh)\.?\s?\d[\d,]*\b/gi, "");
    t = t.replace(/\s{2,}/g, " ").trim();

    const emoji = form.photos[idx];
    const isCover = idx === 0;
    const lower = t.toLowerCase();
    const hasFlavor = /(bright|cosy|cozy|spacious|modern|fresh|airy|natural light|well-?lit|inviting|stylish|generous)/i.test(lower);

    const flavorByEmoji: Record<string, string> = {
      "🛋️": "bright and inviting",
      "🛏️": "restful and freshly made",
      "🍳": "modern and well-equipped",
      "🚿": "clean and well-finished",
      "🏠": "welcoming",
      "🏢": "well-kept",
      "🏘️": "calm and well-maintained",
    };
    const flavor = flavorByEmoji[emoji] || "well-presented";

    if (!hasFlavor) {
      // Insert flavor naturally after the first noun phrase if possible
      t = t.replace(/^(\w+(?:\s\w+){0,2})/, (m) => `${m} — ${flavor}`);
    }

    if (isCover && !/^cover/i.test(t)) {
      t = `Cover · ${t}`;
    }

    // Trim trailing punctuation and cap length
    t = t.replace(/[.,;:!\-–—\s]+$/g, "");
    if (t.length > 80) t = `${t.slice(0, 77).trimEnd()}…`;
    return t;
  };

  const commitCaption = (idx: number, text: string) => {
    setPhotoCaptions((prev) => ({ ...prev, [idx]: text }));
    setEditingCaption(null);
    setPolishCandidate(null);
    setSavedFlash(idx);
    setTimeout(() => setSavedFlash((s) => (s === idx ? null : s)), 900);
    goToNextUncaptioned(idx);
  };

  const acceptSuggestion = (idx: number, text: string) => {
    if (!polishEnabled) {
      commitCaption(idx, text);
      return;
    }
    const polished = polishCaption(idx, text);
    // If polish didn't meaningfully change the text, save directly
    if (polished.trim().toLowerCase() === text.trim().toLowerCase()) {
      commitCaption(idx, text);
      return;
    }
    setPolishCandidate({ idx, original: text, polished });
  };

  const captionedCount = Object.values(photoCaptions).filter((c) => c && c.trim()).length;

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
                  {(["rental", "shortstay", "commercial"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => update({ type: t, priceUnit: t === "shortstay" ? "/night" : "/mo", amenities: [] })}
                      className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-all ${
                        form.type === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-card card-shadow text-foreground"
                      }`}
                    >
                      {t === "rental" ? "🏠 Rental" : t === "shortstay" ? "🌙 Short Stay" : "🏢 Commercial"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.type === "commercial" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Commercial Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {commercialTypes.map((ct) => (
                    <button
                      key={ct.value}
                      onClick={() => update({ commercialType: ct.value })}
                      className={`py-3 px-3 rounded-xl text-left transition-all ${
                        form.commercialType === ct.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-card card-shadow text-foreground"
                      }`}
                    >
                      <p className="text-sm font-semibold">{ct.label}</p>
                      <p className={`text-[10px] mt-0.5 ${form.commercialType === ct.value ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{ct.desc}</p>
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

            {type !== "service" && form.type !== "commercial" && (
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

            {form.type === "commercial" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Size (sqft)</label>
                  <input
                    value={form.sizeSqft}
                    onChange={(e) => update({ sizeSqft: e.target.value })}
                    placeholder="e.g. 1,200"
                    className="w-full px-3 py-2.5 rounded-xl bg-card card-shadow text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Floor</label>
                  <input
                    value={form.floor}
                    onChange={(e) => update({ floor: e.target.value })}
                    placeholder="e.g. Ground"
                    className="w-full px-3 py-2.5 rounded-xl bg-card card-shadow text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
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
              {form.photos.map((p, i) => {
                const isActive = activeSuggestPhoto === i;
                const isSaved = savedFlash === i;
                return (
                  <div key={i} className="space-y-1">
                    <button
                      onClick={() => setActiveSuggestPhoto(isActive ? null : i)}
                      className={`relative aspect-square w-full rounded-xl bg-card card-shadow flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? "border-accent ring-2 ring-accent/30"
                          : isSaved
                            ? "border-trust"
                            : "border-transparent"
                      }`}
                    >
                      <span className="text-3xl">{p}</span>
                      {i === 0 && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[8px] font-bold">
                          COVER
                        </div>
                      )}
                      {photoCaptions[i] && !isSaved && (
                        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-primary/90 text-primary-foreground text-[8px] font-bold flex items-center gap-0.5">
                          <Sparkles className="w-2 h-2" /> AI
                        </div>
                      )}
                      {isSaved && (
                        <div className="absolute inset-0 rounded-xl bg-trust/15 flex items-center justify-center animate-fade-in">
                          <div className="w-7 h-7 rounded-full bg-trust text-white flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                        className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shrink-0"
                        aria-label={`Remove photo ${i + 1}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {photoCaptions[i] !== undefined ? (
                        editingCaption === i ? (
                          <input
                            autoFocus
                            value={photoCaptions[i]}
                            onChange={(e) => updateCaption(i, e.target.value)}
                            onBlur={() => setEditingCaption(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setEditingCaption(null);
                            }}
                            className="flex-1 min-w-0 px-1.5 py-1 rounded-md bg-card border border-primary/40 text-[9px] text-foreground outline-none"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingCaption(i)}
                            className="flex-1 min-w-0 text-left px-1 text-[9px] text-muted-foreground leading-tight line-clamp-2 hover:text-foreground transition-colors"
                            title={photoCaptions[i]}
                          >
                            {photoCaptions[i]}
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => setActiveSuggestPhoto(i)}
                          className="flex-1 min-w-0 text-left px-1 text-[9px] text-accent font-semibold leading-tight"
                        >
                          + Caption
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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

            {/* Per-photo suggestion picker */}
            {activeSuggestPhoto !== null && form.photos[activeSuggestPhoto] !== undefined && (
              <div
                role="dialog"
                aria-label={`Caption suggestions for photo ${activeSuggestPhoto + 1}`}
                className="rounded-2xl border-2 border-accent/40 bg-card p-4 space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl">{form.photos[activeSuggestPhoto]}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">
                        Photo #{activeSuggestPhoto + 1}
                        <span className="text-muted-foreground font-normal"> of {form.photos.length}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {polishCandidate && polishCandidate.idx === activeSuggestPhoto
                          ? "Pick the version you want to save."
                          : "Tap a suggestion to use it."}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveSuggestPhoto(null); setPolishCandidate(null); }}
                    className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0"
                    aria-label="Close suggestions"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>

                {/* Polish toggle — optional safer/more engaging step */}
                <label className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border">
                  <span className="flex items-center gap-1.5 text-[11px] text-foreground">
                    <Wand2 className="w-3 h-3 text-accent" />
                    Polish before saving
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={polishEnabled}
                    onClick={() => setPolishEnabled((v) => !v)}
                    className={`relative w-8 h-4 rounded-full transition-colors ${polishEnabled ? "bg-accent" : "bg-muted-foreground/30"}`}
                  >
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-card shadow transition-transform ${polishEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </label>

                {polishCandidate && polishCandidate.idx === activeSuggestPhoto ? (
                  <div className="space-y-2 animate-fade-in" role="group" aria-label="Polish caption preview">
                    <button
                      type="button"
                      onClick={() => commitCaption(activeSuggestPhoto, polishCandidate.original)}
                      className="w-full text-left p-2.5 rounded-xl border bg-card border-border active:scale-[0.99] transition-transform"
                      aria-label={`Use original caption: ${polishCandidate.original}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">Original</span>
                        <span className="text-[10px] font-bold text-foreground">Use</span>
                      </div>
                      <p className="text-xs text-foreground leading-snug">{polishCandidate.original}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => commitCaption(activeSuggestPhoto, polishCandidate.polished)}
                      className="w-full text-left p-2.5 rounded-xl border-2 bg-accent/10 border-accent active:scale-[0.99] transition-transform"
                      aria-label={`Use polished caption: ${polishCandidate.polished}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-accent">
                          <Wand2 className="w-2.5 h-2.5" /> Polished · safer & catchier
                        </span>
                        <span className="text-[10px] font-bold text-accent">Use</span>
                      </div>
                      <p className="text-xs text-foreground leading-snug">{polishCandidate.polished}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPolishCandidate(null)}
                      className="w-full py-1.5 text-[11px] font-semibold text-muted-foreground"
                    >
                      ← Back to suggestions
                    </button>
                  </div>
                ) : (
                  <>
                    <ul
                      role="list"
                      aria-label="Caption suggestions"
                      className="space-y-1.5"
                    >
                      {suggestionsFor(activeSuggestPhoto).map((s, si) => (
                        <li key={si}>
                          <button
                            type="button"
                            onClick={() => acceptSuggestion(activeSuggestPhoto, s)}
                            aria-label={`Use caption: ${s}`}
                            className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl border bg-accent/5 border-accent/20 text-left active:scale-[0.99] active:bg-accent/15 transition-transform"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                              <span className="text-xs text-foreground leading-snug">{s}</span>
                            </span>
                            <span className="text-[10px] font-bold text-accent shrink-0">
                              {polishEnabled ? "Polish" : "Use"}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => goToNextUncaptioned(activeSuggestPhoto)}
                        className="flex-1 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-foreground flex items-center justify-center gap-1.5"
                        aria-label="Skip to next photo"
                      >
                        Skip <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setEditingCaption(activeSuggestPhoto); setActiveSuggestPhoto(null); }}
                        className="flex-1 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-foreground flex items-center justify-center gap-1.5"
                        aria-label="Write my own caption"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Write my own
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Keja AI Photo Captions */}
            {form.photos.length >= 1 && (
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-accent/5 via-primary/5 to-background p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Image className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      AI Photo Captions
                      <span className="px-1.5 py-0.5 rounded-md bg-accent/10 text-accent text-[9px] font-semibold uppercase tracking-wide">Beta</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      Suggests what each photo shows so tenants can scan your listing faster. Tap any caption to edit.
                    </p>
                  </div>
                </div>

                {captionedCount > 0 && !captionsGenerating && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      {captionedCount} of {form.photos.length} photos captioned
                    </span>
                    <button
                      onClick={() => { setPhotoCaptions({}); setEditingCaption(null); }}
                      className="text-destructive font-semibold"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={generateCaptions}
                    disabled={captionsGenerating}
                    className="py-2.5 rounded-xl bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform disabled:opacity-60"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${captionsGenerating ? "animate-pulse" : ""}`} />
                    {captionsGenerating
                      ? `${Object.keys(photoCaptions).length}/${form.photos.length}…`
                      : captionedCount > 0
                        ? "Regenerate all"
                        : "Auto-caption all"}
                  </button>
                  <button
                    onClick={() => {
                      const firstMissing = form.photos.findIndex((_, i) => !photoCaptions[i] || !photoCaptions[i].trim());
                      setActiveSuggestPhoto(firstMissing === -1 ? 0 : firstMissing);
                    }}
                    disabled={captionsGenerating}
                    className="py-2.5 rounded-xl bg-card border border-accent/30 text-xs font-bold text-accent flex items-center justify-center gap-1.5 active:scale-95 transition-transform disabled:opacity-60"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> One by one
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center -mt-1">
                  Tap any photo above to pick a one-tap suggestion.
                </p>
              </div>
            )}

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

            {/* Keja AI Description Helper */}
            {form.photos.length >= 1 && (
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-background p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      Keja AI
                      <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-semibold uppercase tracking-wide">Beta</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      Let AI write a polished description from your photos and details — edit anything before publishing.
                    </p>
                  </div>
                </div>

                {/* Tone selector */}
                <div className="flex gap-1.5">
                  {(["friendly", "professional", "luxury"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setAiTone(t)}
                      disabled={aiGenerating}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                        aiTone === t
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground border border-border"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Draft preview */}
                {(aiDraft || aiGenerating) && (
                  <div className="rounded-xl bg-card border border-border p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary uppercase tracking-wide">
                      <Sparkles className="w-3 h-3" />
                      {aiGenerating ? "Generating..." : "AI Draft"}
                    </div>
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap min-h-[60px]">
                      {aiDraft}
                      {aiGenerating && <span className="inline-block w-1.5 h-3 bg-primary animate-pulse ml-0.5 align-middle" />}
                    </p>
                    {!aiGenerating && aiDraft && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={applyAIDraft}
                          className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                        >
                          <Check className="w-3.5 h-3.5" /> Use this description
                        </button>
                        <button
                          onClick={generateKejaAIDescription}
                          className="px-3 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-foreground"
                        >
                          Regenerate
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!aiDraft && !aiGenerating && (
                  <button
                    onClick={generateKejaAIDescription}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Sparkles className="w-4 h-4" />
                    {form.description ? "Rewrite description with Keja AI" : "Write description with Keja AI"}
                  </button>
                )}

                {form.description && !aiDraft && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    Current description will be replaced when you apply the AI draft.
                  </p>
                )}
              </div>
            )}

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
                  <span className="font-semibold text-foreground">
                    {form.photos.length} photos{form.videoUrl ? " + video" : ""}
                    {captionedCount > 0 && (
                      <span className="text-primary"> · {captionedCount} captioned</span>
                    )}
                  </span>
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

              {/* AI photo captions detail */}
              {captionedCount > 0 && (
                <div className="mt-3 bg-card rounded-2xl card-shadow p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <h4 className="text-xs font-bold text-foreground">AI Photo Captions</h4>
                  </div>
                  <ul className="space-y-1.5">
                    {form.photos.map((emoji, idx) => {
                      const caption = photoCaptions[idx];
                      if (!caption) return null;
                      return (
                        <li key={idx} className="flex items-start gap-2 text-[11px]">
                          <span className="text-base leading-none">{emoji}</span>
                          <span className="flex-1 text-foreground leading-snug">
                            <span className="text-muted-foreground font-semibold mr-1">#{idx + 1}</span>
                            {caption}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
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

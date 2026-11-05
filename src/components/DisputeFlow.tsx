import { useEffect, useState } from "react";
import {
  ArrowLeft, CheckCircle2, Clock, AlertTriangle, ShieldCheck, ChevronRight,
  FileText, Scale, Mail, MessageCircle, CalendarClock, Inbox
} from "lucide-react";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import { translate, useLanguage } from "@/lib/language";
import { bookingsApi, trustApi } from "@/lib/backend";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/components/onboarding/RoleSelection";

interface DisputeFlowProps {
  onClose: () => void;
  role: UserRole;
}

type DisputeStep = "select" | "booking" | "details" | "submitted" | "track";

interface Category {
  id: string;
  label: string;
  desc: string;
}

// Tenants never pay KejaSure, so tenant issues are about homes, people and safety.
const tenantCategories: Category[] = [
  { id: "listing-mismatch", label: "Home doesn't match the listing", desc: "Photos, price or amenities differ from what you saw" },
  { id: "fake-listing", label: "Home looks fake or double-listed", desc: "The home isn't real, or it's posted by several people" },
  { id: "no-response", label: "Landlord or caretaker isn't responding", desc: "Accepted, but nobody replies or picks up" },
  { id: "money-demand", label: "Asked to pay outside KejaSure", desc: "Cash, M-Pesa or a deposit demanded before you agreed" },
  { id: "viewing-issue", label: "Viewing went wrong", desc: "Home was occupied, unavailable, or a viewing fee was demanded" },
  { id: "safety", label: "Safety concern", desc: "You felt unsafe at a viewing or with a person" },
];

// Providers book homes and people, so their issues are about tenants, listings and billing.
const providerCategories: Category[] = [
  { id: "tenant-no-show", label: "A booking didn't show up", desc: "The person booked a viewing or stay, then never came" },
  { id: "spam-bookings", label: "Fake or spam requests", desc: "Repeated requests from someone who isn't real" },
  { id: "abuse", label: "Abusive messages", desc: "A user is harassing, threatening or insulting you" },
  { id: "copied-listing", label: "My listing was copied", desc: "Your photos or details appear under someone else's home" },
  { id: "unfair-review", label: "Unfair or fake review", desc: "A review left by someone who never booked with you" },
  { id: "billing", label: "Payment or billing issue", desc: "Double charge, wrong amount or missing receipt" },
  { id: "safety", label: "Safety concern", desc: "You feel unsafe about a user or a visit to your property" },
];

interface BookingRow {
  id: string;
  type: string;
  status: string;
  check_in: string | null;
  created_at: string;
  guest_id: string;
  host_id: string;
  listings: { title: string | null; estate: string | null } | null;
}

interface DisputeRow {
  id: string;
  category: string;
  description: string | null;
  status: string;
  resolution: string | null;
  created_at: string;
  bookings: { type: string | null; status: string | null; listings: { title: string | null; estate: string | null } | null } | null;
}

const typeLabel = (t: string | null) =>
  t === "short_stay" ? translate("Short stay") : t === "service" ? translate("Service") : translate("Viewing");

const statusLabel = (s: string | null) => {
  switch (s) {
    case "accepted": return translate("Accepted");
    case "declined": return translate("Declined");
    case "cancelled": return translate("Cancelled");
    case "completed": return translate("Completed");
    case "reviewing": return translate("Reviewing");
    case "resolved": return translate("Resolved");
    case "closed": return translate("Closed");
    default: return translate("Pending");
  }
};

const shortDate = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const DisputeFlow = ({ onClose, role }: DisputeFlowProps) => {
  useLanguage();
  const { closing, triggerClose } = useOverlayClose(onClose);
  const isTenant = role === "tenant";
  const categories = isTenant ? tenantCategories : providerCategories;

  const [step, setStep] = useState<DisputeStep>("select");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [loadingDisputes, setLoadingDisputes] = useState(true);
  const [filing, setFiling] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [filed, setFiled] = useState<{ id: string; category: string } | null>(null);

  // Only bookings this account actually took part in, filtered by the side they were on.
  const loadBookings = async () => {
    setLoadingBookings(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoadingBookings(false); return; }
    const { data } = await bookingsApi.listMine();
    const rows = (data ?? []) as unknown as BookingRow[];
    setBookings(rows.filter((b) => (isTenant ? b.guest_id === user.id : b.host_id === user.id)));
    setLoadingBookings(false);
  };

  const loadDisputes = async () => {
    setLoadingDisputes(true);
    const { data } = await trustApi.disputes();
    setDisputes((data ?? []) as unknown as DisputeRow[]);
    setLoadingDisputes(false);
  };

  useEffect(() => {
    if (step === "booking") void loadBookings();
    if (step === "track") void loadDisputes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, role]);

  const handleSubmit = async () => {
    if (!selectedBooking || !selectedCategory) return;
    setFiling(true);
    setSubmitError(null);
    const { data, error } = await trustApi.openDispute(selectedBooking, selectedCategory, description.trim());
    setFiling(false);
    if (error || !data) {
      setSubmitError(error?.message || translate("Couldn't file your dispute. Please try again."));
      return;
    }
    setFiled({ id: data.id, category: selectedCategory });
    setStep("submitted");
  };

  const backTo = () => {
    if (step === "details") setStep("booking");
    else if (step === "booking") setStep("select");
    else triggerClose();
  };

  const shell = (children: React.ReactNode) => (
    <div className={`fixed inset-0 z-[60] bg-background overflow-y-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}>
      <div className="px-4 pt-safe pb-8">{children}</div>
    </div>
  );

  const supportRow = (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold text-foreground mb-1">{translate("Need help with something else?")}</p>
      <p className="text-[11px] text-muted-foreground mb-3">
        {translate("Anything that isn't tied to a booking you made is handled by our support team.")}
      </p>
      <div className="space-y-2">
        <a
          href="https://wa.me/254700535287?text=Hi%20KejaSure%20support%2C%20I%20need%20help%20with..."
          className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
        >
          <MessageCircle className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground flex-1">{translate("Live Chat (WhatsApp)")}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </a>
        <a href="mailto:support@kejasure.ke" className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
          <Mail className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground flex-1">{translate("Email Support")}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </a>
      </div>
    </div>
  );

  // ---------- Submitted ----------
  if (step === "submitted") {
    const filedLabel = categories.find((c) => c.id === filed?.category)?.label ?? "";
    return (
      <div className={`fixed inset-0 z-[60] bg-background overflow-y-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}>
        <div className="px-4 pt-safe pb-8 flex flex-col items-center text-center min-h-screen justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-[pulse_1s_ease-in-out_2]">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground mb-2">{translate("Dispute Filed")}</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs">
            {translate("Our team will review your dispute and respond within 48 hours. You'll get updates in the app and by SMS.")}
          </p>

          <div className="w-full bg-card rounded-2xl card-shadow p-4 mb-5 text-left">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{translate("Dispute ID")}</span>
                <span className="font-bold text-foreground">KSG-{String(filed?.id ?? "").slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{translate("Category")}</span>
                <span className="font-semibold text-foreground text-right max-w-[60%]">{translate(filedLabel)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{translate("Status")}</span>
                <span className="font-semibold text-accent">{translate("Open")}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{translate("Expected Response")}</span>
                <span className="font-semibold text-foreground">{translate("Within 48 hours")}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-trust/5 border border-trust/15 w-full mb-5">
            <ShieldCheck className="w-4 h-4 text-trust shrink-0" />
            <p className="text-[11px] text-muted-foreground text-left">
              <span className="font-semibold text-trust">{translate("Your safety matters.")}</span>{" "}
              {translate("If this is urgent, our team will prioritize your case.")}
            </p>
          </div>

          <div className="w-full space-y-2">
            <button
              onClick={() => setStep("track")}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform"
            >
              {translate("Track My Disputes")}
            </button>
            <button
              onClick={triggerClose}
              className="w-full py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              {translate("Close")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Track ----------
  if (step === "track") {
    return shell(
      <>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={triggerClose} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="text-lg font-bold">{translate("My Disputes")}</h1>
        </div>

        {loadingDisputes ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : disputes.length > 0 ? (
          <div className="space-y-3">
            {disputes.map((d) => (
              <div key={d.id} className="bg-card rounded-2xl card-shadow p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-muted-foreground">KSG-{d.id.slice(0, 8).toUpperCase()}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    d.status === "resolved" ? "bg-trust/10 text-trust"
                    : d.status === "closed" ? "bg-muted text-muted-foreground"
                    : "bg-accent/10 text-accent-foreground"
                  }`}>{statusLabel(d.status)}</span>
                </div>
                <p className="text-sm font-semibold mb-1">{translate(categories.find((c) => c.id === d.category)?.label ?? d.category)}</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {translate("Re:")} {d.bookings?.listings?.title ?? translate("Unknown home")} · {shortDate(d.created_at)}
                </p>
                {d.description && (
                  <p className="text-[11px] text-muted-foreground mb-2 line-clamp-3">{d.description}</p>
                )}
                {d.resolution && (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-trust/5 border border-trust/15">
                    <ShieldCheck className="w-3.5 h-3.5 text-trust shrink-0 mt-0.5" />
                    <p className="text-[11px] text-foreground">{d.resolution}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Scale className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">{translate("No disputes")}</p>
            <p className="text-xs text-muted-foreground">{translate("All clear! You have no open disputes.")}</p>
          </div>
        )}

        <button
          onClick={() => { setStep("select"); setSelectedCategory(null); setDescription(""); setSelectedBooking(null); setFiled(null); }}
          className="w-full mt-5 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform"
        >
          {translate("File New Dispute")}
        </button>

        <div className="mt-5">{supportRow}</div>
      </>
    );
  }

  // ---------- Select + booking + details ----------
  return shell(
    <>
      <div className="flex items-center gap-3 mb-5">
        <button onClick={backTo} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
        <h1 className="text-lg font-bold">
          {step === "select" ? translate("File a Dispute") : step === "booking" ? translate("Pick a Booking") : translate("Dispute Details")}
        </h1>
      </div>

      <div className="flex gap-2 mb-5">
        <div className="flex-1 h-1 rounded-full bg-primary" />
        <div className={`flex-1 h-1 rounded-full ${step === "booking" || step === "details" ? "bg-primary" : "bg-muted"}`} />
        <div className={`flex-1 h-1 rounded-full ${step === "details" ? "bg-primary" : "bg-muted"}`} />
      </div>

      {step === "select" && (
        <>
          <p className="text-sm text-muted-foreground mb-1">{translate("What's the issue?")}</p>
          <p className="text-[11px] text-muted-foreground mb-4">
            {isTenant
              ? translate("KejaSure is free for tenants. You never pay to view or book a home — so tell us if anyone asks you to.")
              : translate("Tell us what happened with a tenant, a listing or your account.")}
          </p>
          <div className="space-y-2 mb-5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-[0.98] text-left ${
                  selectedCategory === c.id ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${selectedCategory === c.id ? "bg-primary" : "bg-muted-foreground/30"}`} />
                <div>
                  <p className="text-sm font-semibold">{translate(c.label)}</p>
                  <p className="text-[10px] text-muted-foreground">{translate(c.desc)}</p>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep("track")}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary mb-4"
          >
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground flex-1 text-left">{translate("Track existing disputes")}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => selectedCategory && setStep("booking")}
            disabled={!selectedCategory}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-40"
          >
            {translate("Continue")}
          </button>

          <div className="mt-5">{supportRow}</div>
        </>
      )}

      {step === "booking" && (
        <>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/15 mb-4">
            <Scale className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              {translate("Issue:")} <span className="font-semibold text-foreground">{translate(categories.find((c) => c.id === selectedCategory)?.label ?? "")}</span>
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-1">{translate("Which booking is this about?")}</p>
          <p className="text-[11px] text-muted-foreground mb-4">
            {translate("Disputes are linked to a real booking so our team can check the facts.")}
          </p>

          {loadingBookings ? (
            <div className="space-y-2">
              {[0, 1].map((i) => <div key={i} className="h-20 rounded-2xl bg-secondary/50 animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10 rounded-2xl border border-border bg-card">
              <Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">{translate("No bookings yet")}</p>
              <p className="text-xs text-muted-foreground mb-4 max-w-[260px] mx-auto">
                {isTenant
                  ? translate("You can only dispute a home you've requested or booked on KejaSure.")
                  : translate("You can only dispute a booking made on one of your homes or services.")}
              </p>
              <button onClick={triggerClose} className="px-5 py-2.5 rounded-xl bg-secondary text-xs font-semibold text-foreground">
                {translate("Close")}
              </button>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {bookings.map((b) => {
                const active = selectedBooking === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBooking(b.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-[0.98] text-left ${
                      active ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <CalendarClock className={`w-5 h-5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{b.listings?.title ?? translate("Home")}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {typeLabel(b.type)} · {statusLabel(b.status)}
                        {b.listings?.estate ? ` · ${b.listings.estate}` : ""}
                        {b.check_in ? ` · ${shortDate(b.check_in)}` : ""}
                      </p>
                    </div>
                    {active && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => selectedBooking && setStep("details")}
            disabled={!selectedBooking}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-40"
          >
            {translate("Continue")}
          </button>
        </>
      )}

      {step === "details" && (
        <>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/15 mb-4">
            <Scale className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              {translate("Issue:")} <span className="font-semibold text-foreground">{translate(categories.find((c) => c.id === selectedCategory)?.label ?? "")}</span>
            </p>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-foreground mb-1.5 block">{translate("Describe what happened")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={translate("Tell us what went wrong. Include dates, names, and any details that help us investigate...")}
              className="w-full h-28 p-3 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              maxLength={1000}
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{description.length}/1000</p>
          </div>

          {submitError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/5 border border-destructive/15 mb-4">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-[11px] text-destructive">{submitError}</p>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/5 border border-accent/15 mb-5">
            <Clock className="w-4 h-4 text-accent shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              {translate("We'll respond within")} <span className="font-semibold text-accent-foreground">{translate("48 hours")}</span>.{" "}
              {translate("Urgent safety concerns are prioritized.")}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!description.trim() || filing}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {filing ? translate("Filing...") : translate("Submit Dispute")}
          </button>
        </>
      )}
    </>
  );
};

export default DisputeFlow;

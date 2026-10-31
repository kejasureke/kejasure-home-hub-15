import { useState } from "react";
import { Bus, CheckCircle2, Clock, Receipt, NotebookPen, Flag } from "lucide-react";
import type { Property } from "@/data/mockData";
import { homeDetails, costSummary, freshAvailability, useHouseHunting, writeLocal } from "@/lib/houseHunting";
import { translate as t, useLanguage } from "@/lib/language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ViewingNotebook from "./ViewingNotebook";
import { toast } from "sonner";

const money = (n?: number) => n === undefined ? t("Not provided") : `KES ${n.toLocaleString("en-KE")}`;
export default function HouseHuntingDetails({ property, onRequestUpdate }: { property: Property; onRequestUpdate: () => void }) {
  useLanguage(); useHouseHunting();
  const d = homeDetails(property);
  const cost = costSummary(property, d);
  const [destination, setDestination] = useState("");
  const [notebook, setNotebook] = useState(false);
  const [showCommute, setShowCommute] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [issue, setIssue] = useState<"taken" | "price">("taken");
  const status = d.availability === "taken" ? "Taken" : d.availability === "viewing" ? "Viewing arranged" : d.availability === "available" ? "Available" : "Availability not confirmed";
  const date = d.confirmedAt && Number.isFinite(Date.parse(d.confirmedAt)) ? new Date(d.confirmedAt).toLocaleString("en-KE") : null;
  const sameDestination = destination.trim() && d.destination?.trim().toLowerCase() === destination.trim().toLowerCase();
  return <div className="space-y-6 mb-6">
    <section className="border-y border-border py-4 space-y-3">
      <h2 className="font-semibold flex gap-2 items-center"><CheckCircle2 className="size-4 text-primary" />{t("Still available?")}</h2>
      <div className="flex items-center gap-2 text-sm"><span className={freshAvailability(d) ? "text-trust font-semibold" : "text-muted-foreground"}>{t(status)}</span></div>
      <p className="text-xs text-muted-foreground flex gap-2"><Clock className="size-3.5 shrink-0" />{date ? `${t("Last confirmed")}: ${date}` : t("No recent provider confirmation")}</p>
      <p className="text-xs text-muted-foreground">{t("Provider-reported status, not a guarantee. Confirm before travelling.")}</p>
      <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={onRequestUpdate}>{t("Ask when requesting a viewing")}</Button><Button variant="ghost" size="sm" onClick={() => setFeedback(!feedback)}><Flag />{t("Details changed?")}</Button></div>
      {feedback && <div className="space-y-3 border-l-2 border-primary pl-3"><div className="flex gap-2"><Button size="sm" variant={issue === "taken" ? "default" : "outline"} onClick={() => setIssue("taken")}>{t("Already taken")}</Button><Button size="sm" variant={issue === "price" ? "default" : "outline"} onClick={() => setIssue("price")}>{t("Different price")}</Button></div>{issue === "price" && <Input aria-label={t("Actual price (KES)")} type="number" min="0" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder={t("Actual price (KES)")} />}<p className="text-xs text-muted-foreground">{t("Saved as a private observation on this phone; not sent to the provider or support.")}</p><Button size="sm" disabled={issue === "price" && (!newPrice || Number(newPrice) < 0)} onClick={() => { try { writeLocal(`kejasure_listing_observation_${property.id}`, { issue, price: issue === "price" ? Number(newPrice) : undefined, date: new Date().toISOString() }); toast.success(t("Observation saved on this phone")); setFeedback(false); } catch { toast.error(t("Could not save observation")); } }}>{t("Save observation")}</Button></div>}
    </section>
    {property.type === "rental" && <section className="space-y-3">
      <h2 className="font-semibold flex gap-2 items-center"><Receipt className="size-4 text-primary" />{t("What do I need to move in?")}</h2>
      <dl className="text-sm space-y-2">{([["First month's rent", property.price], ["Deposit", d.deposit], ["Agency fee", d.agencyFee], ["Agreement fee", d.agreementFee], ["Other upfront costs", d.otherUpfront]] as [string, number | undefined][]).map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt className="text-muted-foreground">{t(label)}</dt><dd className="text-right">{money(value)}</dd></div>)}</dl>
      <div className="flex justify-between gap-3 border-y border-border py-3 font-semibold"><span>{t("Known upfront total")}</span><span className="text-primary">{money(cost.upfront)}</span></div>
      <h3 className="text-sm font-semibold">{t("Monthly extras")}</h3>
      <dl className="space-y-2 text-sm">{([["Water", d.waterMonthly], ["Service charge", d.serviceMonthly], ["Parking", d.parkingMonthly]] as [string, number | undefined][]).map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt className="text-muted-foreground">{t(label)}</dt><dd>{money(value)}</dd></div>)}</dl>
      <p className="text-sm font-semibold">{t("Known monthly total")}: {money(cost.monthly)}</p>
      {!cost.complete && <p className="text-xs text-muted-foreground">{t("Incomplete estimate: unknown charges are not included.")}</p>}
      <p className="text-xs text-muted-foreground">{t("Costs disclosed by the provider. KejaSure does not collect rent, deposits or these fees.")}</p>
    </section>}
    <section className="border-t border-border pt-4 space-y-3">
      <h2 className="font-semibold">{t("House rules & access")}</h2>
      <dl className="text-sm space-y-2">{[["Pets allowed", d.pets === "yes" ? t("Yes") : d.pets === "no" ? t("No") : t("Not provided")], ["Step-free access", d.accessible === "yes" ? t("Yes") : d.accessible === "no" ? t("No") : t("Not provided")], ["Maximum occupants", d.maxOccupants || t("Not provided")], ["Move-in date", d.moveInDate || property.moveInDate || t("Not provided")]].map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt className="text-muted-foreground">{t(String(label))}</dt><dd className="text-right">{value}</dd></div>)}</dl>
    </section>
    <section className="border-t border-border pt-4 space-y-3">
      <h2 className="font-semibold flex gap-2 items-center"><Bus className="size-4 text-primary" />{t("Can I get to work from here?")}</h2>
      <label className="block text-xs space-y-2"><span>{t("Workplace or campus")}</span><Input value={destination} onChange={e => { setDestination(e.target.value); setShowCommute(false); }} placeholder={t("Enter your destination")} /></label>
      <Button variant="outline" size="sm" disabled={!destination.trim()} onClick={() => setShowCommute(true)}>{t("Check commute details")}</Button>
      {showCommute && <div className="space-y-2 text-sm"><p className="font-semibold">{property.estate} → {destination}</p>{sameDestination ? <><p>{t("Nearest matatu stage")}: {d.stage || t("Not provided")}</p><p>{t("Route / SACCO")}: {d.route || t("Not provided")}</p><p>{t("Walk to stage (minutes)")}: {d.walkMinutes ?? t("Not provided")}</p><p>{t("Ride time (minutes)")}: {d.rideMinutes ?? t("Not provided")}</p><p>{t("One-way fare (KES)")}: {money(d.fare)}</p><p className="text-xs text-muted-foreground">{t("Provider estimates only. Routes, traffic and fares may change.")}</p></> : <p className="text-xs text-muted-foreground">{t("No supplied route or fare for this destination. Ask the provider; KejaSure has not calculated a journey.")}</p>}</div>}
      {!showCommute && d.stage && <p className="text-xs text-muted-foreground">{t("Nearest matatu stage")}: {d.stage}</p>}
    </section>
    <Button variant="secondary" className="w-full" onClick={() => setNotebook(true)}><NotebookPen />{t("My viewing notes")}</Button>
    {notebook && <ViewingNotebook property={property} onClose={() => setNotebook(false)} />}
  </div>;
}
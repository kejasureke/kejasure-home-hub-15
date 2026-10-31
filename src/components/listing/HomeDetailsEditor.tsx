import type { HomeDetails } from "@/lib/houseHunting";
import { translate as t, useLanguage } from "@/lib/language";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Bus, Receipt, Home } from "lucide-react";

export default function HomeDetailsEditor({ value, onChange }: { value: HomeDetails; onChange: (v: HomeDetails) => void }) {
  useLanguage();
  const set = (v: Partial<HomeDetails>) => onChange({ ...value, ...v });
  const numberField = (key: keyof HomeDetails, label: string) => (
    <label key={key} className="block text-xs font-medium space-y-1.5">
      <span>{t(label)}</span>
      <Input type="number" min="0" inputMode="numeric" value={value[key] ?? ""} placeholder={t("Not provided")} onChange={e => set({ [key]: e.target.value === "" ? undefined : Math.max(0, Number(e.target.value)) })} />
    </label>
  );
  const textField = (key: keyof HomeDetails, label: string, type = "text") => (
    <label key={key} className="block text-xs font-medium space-y-1.5"><span>{t(label)}</span><Input type={type} value={String(value[key] ?? "")} onChange={e => set({ [key]: e.target.value })} /></label>
  );
  return <div className="space-y-6 border-t border-border pt-5">
    <section className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" />{t("Availability confirmation")}</h3>
      <div className="flex flex-wrap gap-2">{(["available", "viewing", "taken"] as const).map(status => <Button key={status} size="sm" variant={value.availability === status ? "default" : "outline"} onClick={() => set({ availability: status, confirmedAt: new Date().toISOString() })}>{t(status === "available" ? "Available" : status === "viewing" ? "Viewing arranged" : "Taken")}</Button>)}</div>
      <Button variant="secondary" size="sm" disabled={!value.availability} onClick={() => set({ confirmedAt: new Date().toISOString() })}>{t("Confirm status today")}</Button>
    </section>
    <section className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2"><Receipt className="size-4 text-primary" />{t("Move-in costs")}</h3>
      <p className="text-xs text-muted-foreground">{t("Enter 0 for no charge. Leave unknown costs blank. KejaSure does not collect these payments.")}</p>
      <div className="grid grid-cols-2 gap-3">{numberField("agencyFee", "Agency fee (KES)")}{numberField("agreementFee", "Agreement fee (KES)")}{numberField("otherUpfront", "Other upfront costs (KES)")}{numberField("waterMonthly", "Monthly water (KES)")}{numberField("serviceMonthly", "Monthly service charge (KES)")}{numberField("parkingMonthly", "Monthly parking (KES)")}</div>
    </section>
    <section className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2"><Home className="size-4 text-primary" />{t("House rules & access")}</h3>
      <div className="grid grid-cols-2 gap-3">{([['pets', 'Pets allowed'], ['accessible', 'Step-free access']] as const).map(([key, label]) => <label key={key} className="text-xs font-medium space-y-1.5"><span className="block">{t(label)}</span><select className="h-10 w-full rounded-md border border-input bg-background px-2" value={value[key] || "ask"} onChange={e => set({ [key]: e.target.value })}><option value="ask">{t("Not provided")}</option><option value="yes">{t("Yes")}</option><option value="no">{t("No")}</option></select></label>)}{numberField("maxOccupants", "Maximum occupants")}{textField("moveInDate", "Move-in date", "date")}</div>
    </section>
    <section className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2"><Bus className="size-4 text-primary" />{t("Matatu commute")}</h3>
      <p className="text-xs text-muted-foreground">{t("Provider estimates only. Routes, traffic and fares may change.")}</p>
      {textField("stage", "Nearest matatu stage")}{textField("route", "Route / SACCO")}{textField("destination", "Destination served")}
      <div className="grid grid-cols-2 gap-3">{numberField("walkMinutes", "Walk to stage (minutes)")}{numberField("rideMinutes", "Ride time (minutes)")}{numberField("fare", "One-way fare (KES)")}</div>
    </section>
  </div>;
}
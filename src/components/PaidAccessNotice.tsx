import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import SubscriptionPlans from "./SubscriptionPlans";
import { translate, useLanguage } from "@/lib/language";

export default function PaidAccessNotice({ loading = false }: { loading?: boolean }) {
  useLanguage();
  const [showPlans, setShowPlans] = useState(false);
  return <>
    <div className="p-4 border border-border rounded-lg bg-secondary space-y-3">
      <p className="text-xs text-muted-foreground flex items-start gap-2"><Lock className="w-4 h-4 shrink-0" />{translate(loading ? "Checking your plan…" : "Subscribe to request viewings, chat and access contacts. Phone numbers also require an accepted booking.")}</p>
      {!loading && <Button size="sm" onClick={() => setShowPlans(true)}>{translate("View plans")}</Button>}
    </div>
    {showPlans && <div className="fixed inset-0 z-[110]"><SubscriptionPlans onBack={() => setShowPlans(false)} /></div>}
  </>;
}
import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
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
    <DialogPrimitive.Root open={showPlans} onOpenChange={setShowPlans}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          className="fixed inset-0 z-[110] bg-background outline-none"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">{translate("Subscription Plans")}</DialogPrimitive.Title>
          <SubscriptionPlans onBack={() => setShowPlans(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  </>;
}
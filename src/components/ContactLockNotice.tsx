import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import { translate, useLanguage } from "@/lib/language";
import { unlockLine, type RequestCopy } from "@/lib/requestCopy";

/** Shown to signed-out visitors: KejaSure is free for tenants, contacts unlock on acceptance. */
export default function ContactLockNotice({ loading = false, copy }: { loading?: boolean; copy: RequestCopy }) {
  useLanguage();
  const signIn = () => {
    try {
      localStorage.removeItem("kejasure_onboarded");
      localStorage.removeItem("kejasure_onboarding_progress");
    } catch {}
    window.location.reload();
  };
  return (
    <div className="p-4 border border-border rounded-lg bg-secondary space-y-3">
      <p className="text-xs text-muted-foreground flex items-start gap-2">
        <Lock className="w-4 h-4 shrink-0" />
        <span>{loading ? translate("Checking your account…") : <>{translate("Sign in free to send your request.")} {unlockLine(copy)}</>}</span>
      </p>
      {!loading && <Button size="sm" onClick={signIn}>{translate("Sign in")}</Button>}
    </div>
  );
}

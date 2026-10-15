import { ArrowLeft, ShieldAlert, ShieldCheck, ShieldQuestion, ClipboardPaste, Search } from "lucide-react";
import { useState } from "react";
import { useOverlayClose } from "@/hooks/useOverlayClose";
import { useHardwareBack } from "@/hooks/useHardwareBack";
import { haptic } from "@/lib/despia";
import { properties } from "@/data/mockData";
import { getScamRiskScore } from "@/utils/scamDetection";

// Numbers reported by the community (sample data until reports are wired up)
const FLAGGED_NUMBERS: Record<string, { reports: number; reason: string }> = {
  "254711000111": { reports: 14, reason: "Asked for deposit before any viewing" },
  "254722333444": { reports: 6, reason: "Listed a house that doesn't exist" },
  "254700999888": { reports: 3, reason: "Pushed people to pay on WhatsApp" },
};

const normalisePhone = (s: string) => {
  const d = s.replace(/\D/g, "");
  if (d.startsWith("254") && d.length === 12) return d;
  if (d.startsWith("0") && d.length === 10) return "254" + d.slice(1);
  if ((d.startsWith("7") || d.startsWith("1")) && d.length === 9) return "254" + d;
  return null;
};

type Result =
  | { kind: "listing"; title: string; level: "low" | "medium" | "high"; label: string; flags: string[] }
  | { kind: "phone"; flagged: boolean; reports?: number; reason?: string; phone: string }
  | { kind: "unknown" };

const ScamCheckScreen = ({ onBack }: { onBack: () => void }) => {
  const { closing, triggerClose } = useOverlayClose(onBack);
  useHardwareBack(true, triggerClose);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  const check = (raw = input) => {
    const v = raw.trim();
    if (!v) return;
    const listingId = v.match(/listing\/([\w-]+)/)?.[1];
    if (listingId) {
      const p = properties.find((x) => x.id === listingId);
      if (p) {
        const r = getScamRiskScore(p);
        setResult({ kind: "listing", title: p.title, level: r.level, label: r.label, flags: r.flags });
      } else setResult({ kind: "unknown" });
    } else {
      const phone = normalisePhone(v);
      if (phone) {
        const hit = FLAGGED_NUMBERS[phone];
        setResult({ kind: "phone", flagged: !!hit, reports: hit?.reports, reason: hit?.reason, phone });
      } else setResult({ kind: "unknown" });
    }
    haptic("medium");
  };

  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setInput(t);
      check(t);
    } catch {}
  };

  const bad = (result?.kind === "phone" && result.flagged) || (result?.kind === "listing" && result.level === "high");
  const mid = result?.kind === "listing" && result.level === "medium";

  return (
    <div className={`fixed inset-0 z-[60] bg-background overflow-y-auto ${closing ? "animate-slide-down" : "animate-slide-up"}`}>
      <div className="sticky top-0 z-10 glass-surface border-b border-border px-4 pb-3 pt-safe-compact flex items-center gap-3">
        <button onClick={triggerClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold">Scam check</h1>
          <p className="text-[10px] text-muted-foreground">Check before you pay anyone</p>
        </div>
      </div>

      <div className="px-4 py-5 pb-32 space-y-4">
        <p className="text-sm text-muted-foreground">Paste a KejaSure listing link or a landlord's phone number.</p>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="0712 345 678 or listing link"
            className="flex-1 h-12 px-4 rounded-xl bg-secondary text-sm"
          />
          <button onClick={paste} className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center" aria-label="Paste">
            <ClipboardPaste className="w-5 h-5" />
          </button>
        </div>
        <button onClick={() => check()} className="w-full h-12 rounded-xl gradient-trust text-sm font-bold text-primary-foreground flex items-center justify-center gap-2">
          <Search className="w-4 h-4" /> Check now
        </button>

        {result && (
          <div className={`p-4 rounded-2xl border animate-fade-in ${bad ? "bg-destructive/10 border-destructive/40" : mid ? "bg-accent/10 border-accent/40" : "bg-card border-border"}`}>
            {result.kind === "unknown" ? (
              <div className="flex gap-3">
                <ShieldQuestion className="w-6 h-6 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-bold">Not in our records</p>
                  <p className="text-xs text-muted-foreground mt-1">We couldn't find this. That doesn't mean it's safe. Never pay before you've seen the house in person.</p>
                </div>
              </div>
            ) : result.kind === "phone" ? (
              <div className="flex gap-3">
                {result.flagged ? <ShieldAlert className="w-6 h-6 text-destructive shrink-0" /> : <ShieldCheck className="w-6 h-6 text-trust shrink-0" />}
                <div>
                  <p className="text-sm font-bold">{result.flagged ? `Flagged · ${result.reports} reports` : "No reports on this number"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.flagged ? `People said: "${result.reason}". Don't send money to this number.` : "Nobody has reported this number yet. Still, only pay after a real viewing."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                {result.level === "low" ? <ShieldCheck className="w-6 h-6 text-trust shrink-0" /> : <ShieldAlert className={`w-6 h-6 shrink-0 ${bad ? "text-destructive" : "text-accent"}`} />}
                <div className="min-w-0">
                  <p className="text-sm font-bold">{result.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{result.title}</p>
                  {result.flags.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {result.flags.map((f) => <li key={f} className="text-xs">• {f}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-secondary/50 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Kumbuka</p>
          <p>• Never pay a deposit before a viewing.</p>
          <p>• Keep chats on KejaSure so we can help if something goes wrong.</p>
        </div>
      </div>
    </div>
  );
};

export default ScamCheckScreen;

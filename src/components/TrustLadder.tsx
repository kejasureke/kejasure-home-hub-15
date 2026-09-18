import { Phone, BadgeCheck, Building2, Award, Lock, ChevronRight } from "lucide-react";
import { getTrustState, type TrustState } from "@/lib/trust";
import { haptic } from "@/lib/despia";

interface TrustLadderProps {
  role: string;
  onVerify?: () => void;
  compact?: boolean;
}

const rungs = [
  { key: "phone" as const, icon: Phone, label: "Phone", desc: "Confirmed at sign-up" },
  { key: "id" as const, icon: BadgeCheck, label: "ID + Selfie", desc: "Government ID matched to your face" },
  { key: "business" as const, icon: Building2, label: "Business", desc: "Company registration checked" },
  { key: "pro" as const, icon: Award, label: "Trusted Pro", desc: "5+ completed connections, 4.5★ and above" },
];

const TrustLadder = ({ role, onVerify, compact = false }: TrustLadderProps) => {
  const state: TrustState = getTrustState(role);
  const earned = rungs.filter((r) => state[r.key]).length;

  return (
    <div className="p-4 rounded-2xl bg-card card-shadow">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-foreground">Trust level</p>
          <p className="text-[10px] text-muted-foreground">Each step makes people more likely to reply</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">{earned}/4</span>
      </div>

      <div className="flex items-center gap-1 mb-3">
        {rungs.map((r) => (
          <div key={r.key} className={`h-1.5 flex-1 rounded-full ${state[r.key] ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      {!compact && (
        <div className="space-y-2.5">
          {rungs.map((r) => {
            const done = state[r.key];
            return (
              <div key={r.key} className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {done ? <r.icon className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>{r.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{r.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {onVerify && earned < 4 && (
        <button
          onClick={() => { haptic("light"); onVerify(); }}
          className="w-full mt-3 py-2.5 rounded-xl gradient-trust text-primary-foreground text-xs font-bold flex items-center justify-center gap-1 active:scale-[0.98] transition-transform"
        >
          Move up a level <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default TrustLadder;

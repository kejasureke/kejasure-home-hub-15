import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import type { ScamRiskResult } from "@/utils/scamDetection";

interface ScamWarningBadgeProps {
  risk: ScamRiskResult;
  compact?: boolean;
}

const ScamWarningBadge = ({ risk, compact = false }: ScamWarningBadgeProps) => {
  if (risk.level === "low" && compact) return null;

  if (compact) {
    if (risk.level === "high") {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15 text-[10px] font-semibold text-destructive">
          <ShieldAlert className="w-3 h-3" />
          ⚠️ {risk.label}
        </div>
      );
    }
    if (risk.level === "medium") {
      return (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-3 h-3" />
          {risk.label}
        </div>
      );
    }
    return null;
  }

  // Full version for ListingDetail
  const config = {
    high: {
      icon: ShieldAlert,
      bg: "bg-destructive/5 border-destructive/20",
      iconColor: "text-destructive",
      titleColor: "text-destructive",
      title: "⚠️ Proceed with Extreme Caution",
      description: "This listing has multiple red flags. Verify the property in person and never pay before visiting.",
    },
    medium: {
      icon: AlertTriangle,
      bg: "bg-amber-500/5 border-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      titleColor: "text-amber-700 dark:text-amber-400",
      title: "⚠️ Listing Under Review",
      description: "Some details about this listing need further verification. Exercise caution.",
    },
    low: {
      icon: ShieldCheck,
      bg: "bg-trust/5 border-trust/20",
      iconColor: "text-trust",
      titleColor: "text-trust",
      title: "✓ Low Risk Listing",
      description: "This listing appears trustworthy based on our analysis.",
    },
  };

  const c = config[risk.level];

  return (
    <div className={`p-3 rounded-2xl border ${c.bg} mb-4`}>
      <div className="flex items-start gap-2">
        <c.icon className={`w-5 h-5 shrink-0 mt-0.5 ${c.iconColor}`} />
        <div className="flex-1">
          <p className={`text-xs font-bold ${c.titleColor} mb-1`}>{c.title}</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{c.description}</p>
          
          {risk.flags.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground">Risk factors:</p>
              {risk.flags.map((flag, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className={risk.level === "high" ? "text-destructive" : "text-amber-600 dark:text-amber-400"}>•</span>
                  {flag}
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  risk.level === "high" ? "bg-destructive" : risk.level === "medium" ? "bg-amber-500" : "bg-trust"
                }`}
                style={{ width: `${risk.score}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">{risk.score}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScamWarningBadge;

import { ArrowLeft, Shield, Droplets, Zap, MapPin, Wifi, Volume2, Car, GraduationCap, Heart, ShoppingBag, TreePine, Footprints, Moon, Bus, TrendingUp, TrendingDown, ChevronRight, Building2 } from "lucide-react";
import { useState } from "react";
import { neighborhoodProfiles, type NeighborhoodProfile } from "@/data/neighborhoodData";

interface Props {
  onBack: () => void;
  initialEstate?: string;
}

const formatPrice = (n: number) => `KES ${new Intl.NumberFormat("en-KE").format(n)}`;

const getScoreColor = (score: number) => {
  if (score >= 8) return "text-primary";
  if (score >= 6) return "text-accent";
  return "text-destructive";
};

const getScoreBg = (score: number) => {
  if (score >= 8) return "bg-primary/10";
  if (score >= 6) return "bg-accent/10";
  return "bg-destructive/10";
};

const getLevelColor = (level: string) => {
  if (["Excellent", "Quiet", "Vibrant"].includes(level)) return "text-primary";
  if (["Good", "Moderate"].includes(level)) return "text-accent";
  return "text-destructive";
};

const ScoreBar = ({ score, label, icon: Icon }: { score: number; label: string; icon: any }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
      <Icon className={`w-4 h-4 ${getScoreColor(score)}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className={`text-xs font-bold ${getScoreColor(score)}`}>{score.toFixed(1)}/10</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full ${score >= 8 ? "bg-primary" : score >= 6 ? "bg-accent" : "bg-destructive"}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  </div>
);

const NeighborhoodIntelligence = ({ onBack, initialEstate }: Props) => {
  const [selected, setSelected] = useState<NeighborhoodProfile | null>(
    initialEstate ? neighborhoodProfiles.find(n => n.estate === initialEstate) || null : null
  );

  if (selected) {
    const rentTrendDir = selected.rentTrend.length >= 2
      ? selected.rentTrend[selected.rentTrend.length - 1].avg - selected.rentTrend[0].avg
      : 0;

    return (
      <div className="fixed inset-0 z-40 bg-background overflow-y-auto animate-slide-up">
        <div className="px-4 pt-5 pb-8">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold">{selected.estate}</h1>
              <p className="text-xs text-muted-foreground">{selected.county} County — Full Intelligence Report</p>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-5">
            <p className="text-sm text-foreground leading-relaxed">{selected.summary}</p>
          </div>

          {/* Rent Averages */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Average Rent
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "1 BR", value: selected.avgRent1BR },
                { label: "2 BR", value: selected.avgRent2BR },
                { label: "3 BR", value: selected.avgRent3BR },
              ].map(r => (
                <div key={r.label} className="p-3 rounded-xl bg-secondary text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">{r.label}</p>
                  <p className="text-xs font-bold text-foreground">{formatPrice(r.value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rent Trend Chart */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              {rentTrendDir >= 0 ? <TrendingUp className="w-4 h-4 text-destructive" /> : <TrendingDown className="w-4 h-4 text-primary" />}
              Rent Trend (6 months)
            </h3>
            <div className="p-4 rounded-2xl bg-secondary">
              <div className="flex items-end gap-1 h-24">
                {selected.rentTrend.map((point, i) => {
                  const max = Math.max(...selected.rentTrend.map(p => p.avg));
                  const min = Math.min(...selected.rentTrend.map(p => p.avg));
                  const range = max - min || 1;
                  const height = ((point.avg - min) / range) * 70 + 30;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[8px] text-muted-foreground">{(point.avg / 1000).toFixed(0)}K</span>
                      <div
                        className={`w-full rounded-t-md ${i === selected.rentTrend.length - 1 ? "bg-primary" : "bg-primary/30"}`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[8px] text-muted-foreground">{point.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quality Scores */}
          <div className="mb-5 space-y-3">
            <h3 className="text-sm font-semibold">Area Quality Scores</h3>
            <ScoreBar score={selected.safetyRating} label="Safety & Security" icon={Shield} />
            <ScoreBar score={selected.waterReliability} label="Water Reliability" icon={Droplets} />
            <ScoreBar score={selected.electricityReliability} label="Electricity" icon={Zap} />
            <ScoreBar score={selected.walkabilityScore} label="Walkability" icon={Footprints} />
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { icon: Volume2, label: "Noise Level", value: selected.noiseLevel },
              { icon: Car, label: "Road Access", value: selected.roadAccess },
              { icon: Moon, label: "Nightlife", value: selected.nightlife },
              { icon: ShoppingBag, label: "Nearest Mall", value: selected.nearestMall },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl bg-secondary">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{item.label}</span>
                </div>
                <p className={`text-xs font-semibold ${getLevelColor(item.value)}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Internet Providers */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-primary" />
              Internet Providers
            </h3>
            <div className="flex flex-wrap gap-2">
              {selected.internetProviders.map(p => (
                <span key={p} className="px-3 py-1.5 rounded-xl bg-secondary text-xs font-medium">{p}</span>
              ))}
            </div>
          </div>

          {/* Transport */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Bus className="w-4 h-4 text-primary" />
              Transport Options
            </h3>
            <div className="flex flex-wrap gap-2">
              {selected.transportOptions.map(t => (
                <span key={t} className="px-3 py-1.5 rounded-xl bg-secondary text-xs font-medium">{t}</span>
              ))}
            </div>
          </div>

          {/* Schools */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              Nearby Schools
            </h3>
            <div className="space-y-1.5">
              {selected.nearbySchools.map(s => (
                <div key={s} className="flex items-center gap-2 text-xs text-foreground">
                  <span className="text-primary">•</span> {s}
                </div>
              ))}
            </div>
          </div>

          {/* Hospitals */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-destructive" />
              Nearby Hospitals
            </h3>
            <div className="space-y-1.5">
              {selected.nearbyHospitals.map(h => (
                <div key={h} className="flex items-center gap-2 text-xs text-foreground">
                  <span className="text-destructive">+</span> {h}
                </div>
              ))}
            </div>
          </div>

          {/* Green Spaces */}
          {selected.greenSpaces.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TreePine className="w-4 h-4 text-primary" />
                Green Spaces & Parks
              </h3>
              <div className="flex flex-wrap gap-2">
                {selected.greenSpaces.map(g => (
                  <span key={g} className="px-3 py-1.5 rounded-xl bg-primary/5 text-xs font-medium text-primary">{g}</span>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 rounded-xl bg-secondary text-[10px] text-muted-foreground">
            Data based on community reports, government stats, and verified resident feedback. Updated quarterly.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-background overflow-y-auto animate-slide-up">
      <div className="px-4 pt-5 pb-8">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Neighborhood Intelligence</h1>
            <p className="text-xs text-muted-foreground">Should I live here? Full area profiles.</p>
          </div>
        </div>

        <div className="space-y-3">
          {neighborhoodProfiles.map(n => (
            <button
              key={n.estate}
              onClick={() => setSelected(n)}
              className="w-full text-left p-4 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold">{n.estate}</h3>
                    <p className="text-[10px] text-muted-foreground">{n.county} County</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-full ${getScoreBg(n.safetyRating)}`}>
                    <span className={`text-xs font-bold ${getScoreColor(n.safetyRating)}`}>{n.safetyRating}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>🏠 From {formatPrice(n.avgRent1BR)}/mo</span>
                <span>•</span>
                <span>🔇 {n.noiseLevel}</span>
                <span>•</span>
                <span>🌙 {n.nightlife}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodIntelligence;

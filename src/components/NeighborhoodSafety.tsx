import { ArrowLeft, Shield, Droplets, Zap, Lightbulb, AlertTriangle, TrendingUp, TrendingDown, MapPin, Star, ChevronRight } from "lucide-react";
import { useState } from "react";

interface NeighborhoodSafetyProps {
  onBack: () => void;
  estate?: string;
  county?: string;
}

interface AreaScore {
  name: string;
  county: string;
  overall: number;
  crime: number;
  water: number;
  electricity: number;
  lighting: number;
  trend: "improving" | "stable" | "declining";
  highlights: string[];
  concerns: string[];
}

const mockAreas: AreaScore[] = [
  {
    name: "Kilimani",
    county: "Nairobi",
    overall: 8.2,
    crime: 7.5,
    water: 8.8,
    electricity: 9.0,
    lighting: 7.5,
    trend: "improving",
    highlights: ["24/7 security patrols", "Reliable piped water", "Good street lighting on main roads"],
    concerns: ["Car break-ins reported on side streets", "Occasional water rationing in dry season"],
  },
  {
    name: "Westlands",
    county: "Nairobi",
    overall: 7.8,
    crime: 7.0,
    water: 8.5,
    electricity: 8.5,
    lighting: 7.2,
    trend: "stable",
    highlights: ["Active CCTV coverage", "Multiple police posts", "Consistent power supply"],
    concerns: ["Petty theft near Sarit Centre", "Traffic congestion affects emergency response"],
  },
  {
    name: "South B",
    county: "Nairobi",
    overall: 6.5,
    crime: 5.8,
    water: 7.0,
    electricity: 7.5,
    lighting: 5.7,
    trend: "improving",
    highlights: ["Community policing active", "New street lights installed 2024"],
    concerns: ["Mugging incidents after dark", "Water supply intermittent in some blocks", "Poor lighting in residential lanes"],
  },
  {
    name: "Nyali",
    county: "Mombasa",
    overall: 7.5,
    crime: 7.2,
    water: 6.8,
    electricity: 7.0,
    lighting: 8.5,
    trend: "stable",
    highlights: ["Tourism police presence", "Well-lit beachfront area", "Gated community options"],
    concerns: ["Water shortages during dry season", "Power outages more frequent than Nairobi"],
  },
  {
    name: "Karen",
    county: "Nairobi",
    overall: 8.8,
    crime: 8.5,
    water: 9.0,
    electricity: 9.2,
    lighting: 8.5,
    trend: "stable",
    highlights: ["Very low crime rate", "Reliable borehole water", "Consistent KPLC supply", "Private security firms"],
    concerns: ["Long distance to emergency services", "Limited public transport"],
  },
];

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
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 8 ? "bg-primary" : score >= 6 ? "bg-accent" : "bg-destructive"
          }`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  </div>
);

const NeighborhoodSafety = ({ onBack, estate, county }: NeighborhoodSafetyProps) => {
  const [selectedArea, setSelectedArea] = useState<AreaScore | null>(null);
  const [filterCounty, setFilterCounty] = useState(county || "");

  const counties = [...new Set(mockAreas.map(a => a.county))];
  const filtered = filterCounty ? mockAreas.filter(a => a.county === filterCounty) : mockAreas;

  if (selectedArea) {
    return (
      <div className="fixed inset-0 z-40 bg-background overflow-y-auto animate-slide-up">
        <div className="px-4 pt-5 pb-8">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setSelectedArea(null)} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold">{selectedArea.name}</h1>
              <p className="text-xs text-muted-foreground">{selectedArea.county} County</p>
            </div>
          </div>

          {/* Overall Score */}
          <div className={`p-5 rounded-2xl ${getScoreBg(selectedArea.overall)} mb-5`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Overall Safety Score</span>
              <div className="flex items-center gap-1">
                {selectedArea.trend === "improving" && <TrendingUp className="w-4 h-4 text-primary" />}
                {selectedArea.trend === "declining" && <TrendingDown className="w-4 h-4 text-destructive" />}
                <span className="text-xs text-muted-foreground capitalize">{selectedArea.trend}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-extrabold ${getScoreColor(selectedArea.overall)}`}>
                {selectedArea.overall.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">/10</span>
            </div>
          </div>

          {/* Category Scores */}
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold">Detailed Scores</h3>
            <ScoreBar score={selectedArea.crime} label="Safety & Crime" icon={Shield} />
            <ScoreBar score={selectedArea.water} label="Water Reliability" icon={Droplets} />
            <ScoreBar score={selectedArea.electricity} label="Electricity Supply" icon={Zap} />
            <ScoreBar score={selectedArea.lighting} label="Street Lighting" icon={Lightbulb} />
          </div>

          {/* Highlights */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Highlights
            </h3>
            <div className="space-y-2">
              {selectedArea.highlights.map((h) => (
                <div key={h} className="flex items-start gap-2 text-xs text-foreground">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Concerns */}
          {selectedArea.concerns.length > 0 && (
            <div className="mb-5">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                Things to Note
              </h3>
              <div className="space-y-2">
                {selectedArea.concerns.map((c) => (
                  <div key={c} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-accent mt-0.5">⚠</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 rounded-xl bg-secondary text-[10px] text-muted-foreground">
            <p>Scores are based on community reports, government data, and verified resident feedback. Updated quarterly. Always visit an area in person before committing to a rental.</p>
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
            <h1 className="text-lg font-bold">Neighborhood Safety</h1>
            <p className="text-xs text-muted-foreground">Area scores & insights</p>
          </div>
        </div>

        {/* County filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterCounty("")}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-colors ${
              !filterCounty ? "gradient-trust text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            All Counties
          </button>
          {counties.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCounty(c)}
              className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-colors ${
                filterCounty === c ? "gradient-trust text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Area cards */}
        <div className="space-y-3">
          {filtered.map((area) => (
            <button
              key={area.name}
              onClick={() => setSelectedArea(area)}
              className="w-full text-left p-4 rounded-2xl bg-card card-shadow active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{area.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{area.county} County</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-2.5 py-1 rounded-full ${getScoreBg(area.overall)}`}>
                    <span className={`text-sm font-bold ${getScoreColor(area.overall)}`}>{area.overall.toFixed(1)}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Mini scores */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: Shield, score: area.crime, label: "Crime" },
                  { icon: Droplets, score: area.water, label: "Water" },
                  { icon: Zap, score: area.electricity, label: "Power" },
                  { icon: Lightbulb, score: area.lighting, label: "Light" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <s.icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${getScoreColor(s.score)}`} />
                    <p className={`text-[10px] font-bold ${getScoreColor(s.score)}`}>{s.score.toFixed(1)}</p>
                    <p className="text-[8px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Trend */}
              <div className="flex items-center gap-1 mt-2">
                {area.trend === "improving" && (
                  <>
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-[10px] text-primary font-medium">Improving</span>
                  </>
                )}
                {area.trend === "stable" && (
                  <span className="text-[10px] text-muted-foreground font-medium">— Stable</span>
                )}
                {area.trend === "declining" && (
                  <>
                    <TrendingDown className="w-3 h-3 text-destructive" />
                    <span className="text-[10px] text-destructive font-medium">Declining</span>
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodSafety;

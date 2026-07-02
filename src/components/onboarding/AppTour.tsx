import { useState } from "react";
import { Home, Search, MessageCircle, User, ShieldCheck, Sparkles, ChevronRight, X } from "lucide-react";

interface TourStep {
  icon: typeof Home;
  title: string;
  description: string;
  accent: string;
}

const STEPS: TourStep[] = [
  {
    icon: Sparkles,
    title: "Karibu KejaSure!",
    description: "Pata Keja, Be Sure. Let's show you around in 30 seconds.",
    accent: "from-primary/30 to-accent/20",
  },
  {
    icon: Home,
    title: "Browse verified listings",
    description: "Every keja on the home feed is screened. Look for the green verified badge.",
    accent: "from-primary/30 to-primary/10",
  },
  {
    icon: Search,
    title: "Search smart",
    description: "Filter by county, estate, budget in KES, and amenities that matter to you.",
    accent: "from-accent/30 to-primary/10",
  },
  {
    icon: MessageCircle,
    title: "Chat safely",
    description: "Message landlords inside the app. Contacts unlock once your booking request is accepted.",
    accent: "from-primary/20 to-accent/20",
  },
  {
    icon: ShieldCheck,
    title: "Stay protected",
    description: "Never pay rent or deposits outside the app. Report anything suspicious instantly.",
    accent: "from-destructive/20 to-primary/10",
  },
  {
    icon: User,
    title: "Your profile, your control",
    description: "Manage KYC, saved searches, bookings and notifications from one place.",
    accent: "from-accent/30 to-primary/20",
  },
];

interface AppTourProps {
  onFinish: () => void;
}

const AppTour = ({ onFinish }: AppTourProps) => {
  const [index, setIndex] = useState(0);
  const isLast = index === STEPS.length - 1;
  const step = STEPS[index];
  const Icon = step.icon;
  const progress = ((index + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[95] bg-background flex flex-col animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-safe flex items-center gap-3">
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-trust rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          onClick={onFinish}
          className="text-xs font-semibold text-muted-foreground active:opacity-70 flex items-center gap-1"
          aria-label="Skip tour"
        >
          Skip
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 pt-10">
        <div
          key={index}
          className={`mx-auto w-32 h-32 rounded-3xl bg-gradient-to-br ${step.accent} flex items-center justify-center mb-10 animate-scale-in shadow-lg`}
        >
          <Icon className="w-14 h-14 text-primary" strokeWidth={1.8} />
        </div>

        <div key={`text-${index}`} className="animate-fade-in text-center">
          <h1 className="text-2xl font-extrabold text-foreground mb-3">{step.title}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed px-2">{step.description}</p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-10">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-primary" : "w-1.5 bg-muted"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-auto pb-10 space-y-3">
          <button
            onClick={() => (isLast ? onFinish() : setIndex(index + 1))}
            className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 gradient-trust text-primary-foreground active:scale-[0.98] transition-transform"
          >
            {isLast ? "Get Started" : "Next"}
            <ChevronRight className="w-5 h-5" />
          </button>
          {!isLast && (
            <button
              onClick={onFinish}
              className="w-full py-3 rounded-2xl font-semibold text-sm text-muted-foreground active:opacity-70"
            >
              Skip tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppTour;

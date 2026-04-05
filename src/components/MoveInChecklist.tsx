import { ArrowLeft, CheckCircle2, Circle, Package, Sparkles, Wifi, Shield, Wrench, Zap, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";
import { serviceProviders } from "@/data/mockData";
import type { Property } from "@/data/mockData";
import { toast } from "sonner";

interface MoveInChecklistProps {
  property: Property;
  onBack: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  estimatedCost: string;
  completed: boolean;
  serviceMatch?: string; // service provider category
}

const defaultChecklist: Omit<ChecklistItem, "completed">[] = [
  { id: "movers", title: "Hire Movers", description: "Professional moving service for furniture & boxes", icon: Package, category: "Moving", estimatedCost: "KES 5,000 - 15,000", serviceMatch: "Movers" },
  { id: "cleaning", title: "Deep Clean", description: "Pre-move-in deep cleaning of the entire property", icon: Sparkles, category: "Cleaning", estimatedCost: "KES 2,500 - 5,000", serviceMatch: "Cleaners" },
  { id: "internet", title: "Internet Installation", description: "Set up fiber or WiFi connection", icon: Wifi, category: "Utilities", estimatedCost: "KES 3,000 - 8,000", serviceMatch: "Internet Installers" },
  { id: "locks", title: "Change Locks", description: "Replace door locks for security", icon: Shield, category: "Security", estimatedCost: "KES 1,500 - 4,000", serviceMatch: "Security" },
  { id: "plumbing", title: "Plumbing Check", description: "Inspect pipes, taps, and drainage", icon: Wrench, category: "Maintenance", estimatedCost: "KES 1,000 - 3,000", serviceMatch: "Plumbers" },
  { id: "electrical", title: "Electrical Check", description: "Inspect wiring, sockets, and switches", icon: Zap, category: "Maintenance", estimatedCost: "KES 1,500 - 3,000", serviceMatch: "Electricians" },
];

const MoveInChecklist = ({ property, onBack }: MoveInChecklistProps) => {
  const [items, setItems] = useState<ChecklistItem[]>(
    defaultChecklist.map(item => ({ ...item, completed: false }))
  );
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  const matchedProviders = selectedService
    ? serviceProviders.filter(sp => sp.category === selectedService)
    : [];

  const handleBookService = (providerName: string) => {
    toast.success(`📞 Connecting you with ${providerName}...`);
    setSelectedService(null);
  };

  return (
    <div className="fixed inset-0 z-40 bg-background overflow-y-auto animate-slide-up">
      {/* Header */}
      <div className="gradient-trust px-4 pt-6 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-primary-foreground">Move-In Checklist</h1>
            <p className="text-xs text-primary-foreground/70">{property.title}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-card/20 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary-foreground">{completedCount}/{items.length} completed</span>
            <span className="text-xs font-bold text-primary-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-card/30 overflow-hidden">
            <div className="h-full rounded-full bg-card transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Move-in date */}
      {property.moveInDate && (
        <div className="mx-4 mt-4 p-3 rounded-2xl bg-secondary flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs font-semibold">Move-in Date</p>
            <p className="text-xs text-muted-foreground">{property.moveInDate}</p>
          </div>
        </div>
      )}

      {/* Checklist items */}
      <div className="px-4 py-4 space-y-3 pb-24">
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-2xl card-shadow overflow-hidden">
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              {item.completed ? (
                <CheckCircle2 className="w-6 h-6 text-trust shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                  {item.title}
                </p>
                <p className="text-[10px] text-muted-foreground">{item.description}</p>
                <p className="text-[10px] font-medium text-primary mt-0.5">{item.estimatedCost}</p>
              </div>
              <item.icon className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>

            {/* Book service CTA */}
            {!item.completed && item.serviceMatch && (
              <button
                onClick={() => setSelectedService(item.serviceMatch!)}
                className="w-full flex items-center justify-between px-4 py-2.5 border-t border-border bg-primary/5 text-xs font-medium text-primary active:bg-primary/10"
              >
                <span>Find a {item.serviceMatch.toLowerCase().replace(/s$/, "")}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* Bundle discount banner */}
        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-bold text-accent-foreground">Bundle & Save</h3>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
            Book 3+ services together and get up to 15% off your move-in costs. Our verified service providers handle everything.
          </p>
          <button
            onClick={() => toast.success("Bundle booking coming soon! 🎉")}
            className="w-full py-2.5 rounded-xl gradient-trust text-xs font-semibold text-primary-foreground active:scale-[0.98] transition-transform"
          >
            Book Move-In Bundle
          </button>
        </div>
      </div>

      {/* Service provider bottom sheet */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-end bg-foreground/30 backdrop-blur-sm" onClick={() => setSelectedService(null)}>
          <div className="w-full max-h-[60vh] bg-card rounded-t-3xl overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 pb-3">
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
              <h3 className="text-base font-bold">Available {selectedService}</h3>
              <p className="text-xs text-muted-foreground">Near {property.estate}, {property.county}</p>
            </div>
            <div className="px-6 pb-6 space-y-3">
              {matchedProviders.length > 0 ? matchedProviders.map(sp => (
                <div key={sp.id} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary">
                  <div className="text-2xl">{sp.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{sp.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-accent">⭐ {sp.rating}</span>
                      <span className="text-[10px] text-muted-foreground">{sp.reviews} reviews</span>
                      <span className="text-[10px] text-muted-foreground">• {sp.price}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookService(sp.name)}
                    className="px-3 py-2 rounded-xl gradient-trust text-[10px] font-semibold text-primary-foreground"
                  >
                    Book
                  </button>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-6">No providers found in this area yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoveInChecklist;

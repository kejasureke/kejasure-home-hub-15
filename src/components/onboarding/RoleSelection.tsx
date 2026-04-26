import { useState } from "react";
import { Home, Building2, Briefcase, Palmtree, Wrench, ChevronRight } from "lucide-react";

export type UserRole = "tenant" | "landlord" | "agency" | "stayhost" | "serviceprovider";

interface RoleSelectionProps {
  onSelect: (role: UserRole) => void;
}

const roles: { id: UserRole; icon: any; title: string; subtitle: string }[] = [
  { id: "tenant", icon: Home, title: "Tenant", subtitle: "Find rentals & short stays" },
  { id: "landlord", icon: Building2, title: "Landlord", subtitle: "List & manage properties" },
  { id: "agency", icon: Briefcase, title: "Agency", subtitle: "Manage multiple listings" },
  { id: "stayhost", icon: Palmtree, title: "Stay Host", subtitle: "Host short-term guests" },
  { id: "serviceprovider", icon: Wrench, title: "Service Provider", subtitle: "Offer move-in services" },
];

const RoleSelection = ({ onSelect }: RoleSelectionProps) => {
  const [selected, setSelected] = useState<UserRole | null>(null);

  return (
    <div className="fixed inset-0 z-[90] bg-background flex flex-col">
      <div className="px-6 pt-8 pb-4">
        <h1 className="text-2xl font-extrabold text-foreground">I am a...</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose how you'll use KejaSure</p>
      </div>

      <div className="flex-1 px-6 space-y-3 overflow-y-auto">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selected === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-card border-2 border-transparent card-shadow"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isSelected ? "gradient-trust" : "bg-secondary"
              }`}>
                <Icon className={`w-6 h-6 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold">{role.title}</p>
                <p className="text-xs text-muted-foreground">{role.subtitle}</p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full gradient-trust flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-6 pb-10 pt-4">
        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
            selected
              ? "gradient-trust text-primary-foreground active:scale-[0.98]"
              : "bg-muted text-muted-foreground"
          }`}
        >
          Continue
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;

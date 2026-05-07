import { useState, useCallback, useEffect } from "react";
import WelcomeScreens from "./WelcomeScreens";
import RoleSelection, { type UserRole } from "./RoleSelection";
import AuthFlow from "./AuthFlow";
import ProfileSetup from "./ProfileSetup";
import AppTour from "./AppTour";

type OnboardingStep = "welcome" | "role" | "auth" | "profile" | "tour";

const ONBOARDING_KEY = "kejasure_onboarded";
const PROGRESS_KEY = "kejasure_onboarding_progress";
const ROLE_KEY = "kejasure_role";

interface Progress {
  step: OnboardingStep;
  role: UserRole | null;
  loginMode: boolean;
}

export const isOnboarded = () => {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return false;
  }
};

const loadProgress = (): Progress => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Progress>;
      const validSteps: OnboardingStep[] = ["welcome", "role", "auth", "profile", "tour"];
      if (p.step && validSteps.includes(p.step)) {
        return {
          step: p.step,
          role: (p.role as UserRole | null) ?? null,
          loginMode: !!p.loginMode,
        };
      }
    }
  } catch {}
  return { step: "welcome", role: null, loginMode: false };
};

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const initial = loadProgress();
  const [step, setStep] = useState<OnboardingStep>(initial.step);
  const [role, setRole] = useState<UserRole | null>(initial.role);
  const [loginMode, setLoginMode] = useState(initial.loginMode);

  // Persist progress on every change
  useEffect(() => {
    try {
      localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({ step, role, loginMode } satisfies Progress)
      );
    } catch {}
  }, [step, role, loginMode]);

  const finish = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    if (role) localStorage.setItem(ROLE_KEY, role);
    try { localStorage.removeItem(PROGRESS_KEY); } catch {}
    onComplete();
  }, [onComplete, role]);

  switch (step) {
    case "welcome":
      return (
        <WelcomeScreens
          onComplete={() => setStep("role")}
          onSkip={finish}
          onLogin={() => {
            setLoginMode(true);
            setStep("auth");
          }}
        />
      );
    case "role":
      return (
        <RoleSelection
          onSelect={(r) => {
            setRole(r);
            setLoginMode(false);
            setStep("auth");
          }}
        />
      );
    case "auth":
      return (
        <AuthFlow
          onComplete={() => (loginMode ? finish() : setStep("profile"))}
          onBack={() => setStep(loginMode ? "welcome" : "role")}
        />
      );
    case "profile":
      return role ? (
        <ProfileSetup role={role} onComplete={() => setStep("tour")} onBack={() => setStep("auth")} />
      ) : null;
    case "tour":
      return <AppTour onFinish={finish} />;
    default:
      return null;
  }
};

export default OnboardingFlow;

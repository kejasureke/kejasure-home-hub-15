import { useState, useCallback } from "react";
import WelcomeScreens from "./WelcomeScreens";
import RoleSelection, { type UserRole } from "./RoleSelection";
import AuthFlow from "./AuthFlow";
import ProfileSetup from "./ProfileSetup";

type OnboardingStep = "welcome" | "role" | "auth" | "profile";

const ONBOARDING_KEY = "kejasure_onboarded";

export const isOnboarded = () => {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return false;
  }
};

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [role, setRole] = useState<UserRole | null>(null);

  const finish = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    if (role) localStorage.setItem("kejasure_role", role);
    onComplete();
  }, [onComplete, role]);

  switch (step) {
    case "welcome":
      return <WelcomeScreens onComplete={() => setStep("role")} />;
    case "role":
      return (
        <RoleSelection
          onSelect={(r) => {
            setRole(r);
            setStep("auth");
          }}
        />
      );
    case "auth":
      return <AuthFlow onComplete={() => setStep("profile")} onBack={() => setStep("role")} />;
    case "profile":
      return role ? (
        <ProfileSetup role={role} onComplete={finish} onBack={() => setStep("auth")} />
      ) : null;
    default:
      return null;
  }
};

export default OnboardingFlow;

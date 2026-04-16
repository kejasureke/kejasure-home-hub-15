import { useState, useEffect } from "react";
import { Zap, CheckCircle2 } from "lucide-react";

interface BoostProcessingOverlayProps {
  boostName: string;
  onComplete: () => void;
}

const steps = [
  "Preparing your boost...",
  "Verifying listing eligibility...",
  "Connecting to payment...",
];

const BoostProcessingOverlay = ({ boostName, onComplete }: BoostProcessingOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 700);
    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 4;
      });
    }, 80);
    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(onComplete, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-[85%] max-w-xs bg-card rounded-3xl p-8 text-center animate-scale-in">
        {/* Animated icon */}
        <div className="relative w-20 h-20 mx-auto mb-5">
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-3 border-primary/20" />
          <div
            className="absolute inset-0 rounded-full border-3 border-transparent border-t-primary animate-spin"
            style={{ animationDuration: "1s" }}
          />
          {/* Center icon */}
          <div className="absolute inset-2 rounded-full gradient-premium flex items-center justify-center">
            <Zap className="w-8 h-8 text-accent-foreground animate-pulse" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1">{boostName}</h3>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-secondary mb-4 overflow-hidden">
          <div
            className="h-full rounded-full gradient-trust transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-2 mb-3">
          {steps.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                i <= currentStep ? "opacity-100" : "opacity-0 translate-y-2"
              }`}
            >
              {i < currentStep ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-trust shrink-0" />
              ) : i === currentStep ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className={i <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Bouncing dots */}
        <div className="flex items-center justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoostProcessingOverlay;

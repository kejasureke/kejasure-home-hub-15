import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SplashScreen from "@/components/SplashScreen";
import DesktopBlocker from "@/components/DesktopBlocker";
import OnboardingFlow, { isOnboarded } from "@/components/onboarding/OnboardingFlow";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useEffect } from "react";

const queryClient = new QueryClient();

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [onboarded, setOnboarded] = useState(() => isOnboarded());
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <DesktopBlocker />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        {!showSplash && !onboarded && (
          <OnboardingFlow onComplete={() => setOnboarded(true)} />
        )}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

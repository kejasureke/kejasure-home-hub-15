import { useState, useEffect, useCallback } from "react";

const KYC_KEY = "kejasure_kyc_verified";

export const useKYCStatus = (role: string) => {
  const storageKey = `${KYC_KEY}_${role}`;

  const [isVerified, setIsVerified] = useState(() => {
    try {
      return localStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  });

  const markVerified = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setIsVerified(true);
    window.dispatchEvent(new CustomEvent("kyc-status-changed", { detail: { role } }));
  }, [storageKey, role]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.role === role) {
        setIsVerified(localStorage.getItem(storageKey) === "true");
      }
    };
    window.addEventListener("kyc-status-changed", handler);
    return () => window.removeEventListener("kyc-status-changed", handler);
  }, [role, storageKey]);

  return { isVerified, markVerified };
};

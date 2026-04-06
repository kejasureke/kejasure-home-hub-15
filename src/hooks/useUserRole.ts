import { useState, useCallback } from "react";
import type { UserRole } from "@/components/onboarding/RoleSelection";

const ROLE_KEY = "kejasure_role";

export const useUserRole = () => {
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      return (localStorage.getItem(ROLE_KEY) as UserRole) || "tenant";
    } catch {
      return "tenant";
    }
  });

  const setRole = useCallback((r: UserRole) => {
    setRoleState(r);
    localStorage.setItem(ROLE_KEY, r);
  }, []);

  const isTenant = role === "tenant";
  const isLandlord = role === "landlord";
  const isAgency = role === "agency";
  const isStayHost = role === "stayhost";
  const isServiceProvider = role === "serviceprovider";

  return { role, setRole, isTenant, isLandlord, isAgency, isStayHost, isServiceProvider };
};

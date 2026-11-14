/** Shared "Other Services" group: everyday deliveries a provider can offer (pick several). */
export const OTHER_SERVICES = "Other Services";

export const OTHER_SUBSERVICES = [
  { value: "Gas Delivery", icon: "🔥" },
  { value: "Water Delivery", icon: "💧" },
  { value: "Food Delivery", icon: "🍲" },
  { value: "Grocery Delivery", icon: "🛒" },
  { value: "Parcels & Errands", icon: "📦" },
  { value: "Garbage Collection", icon: "♻️" },
] as const;

export const OTHER_SUBSERVICE_VALUES: string[] = OTHER_SUBSERVICES.map((s) => s.value);

/** Keeps only known sub-services, in display order, without duplicates. */
export function cleanSubServices(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const set = new Set(input.filter((v): v is string => typeof v === "string"));
  return OTHER_SUBSERVICE_VALUES.filter((v) => set.has(v));
}

/** True when a provider matches the client's chosen sub-service filter ("All" = any). */
export function matchesSubService(subServices: string[] | undefined, filter: string): boolean {
  if (filter === "All") return true;
  return (subServices ?? []).includes(filter);
}

const PROVIDER_PICK_KEY = "kejasure_provider_service_pick";

/** Remembers the provider's onboarding pick so their first service listing starts pre-filled. */
export function saveProviderServicePick(category: string, otherServices: string[]) {
  try { localStorage.setItem(PROVIDER_PICK_KEY, JSON.stringify({ category, otherServices: cleanSubServices(otherServices) })); } catch {}
}

export function readProviderServicePick(): { category: string; otherServices: string[] } | null {
  try {
    const raw = JSON.parse(localStorage.getItem(PROVIDER_PICK_KEY) || "null");
    if (!raw || typeof raw.category !== "string") return null;
    return { category: raw.category, otherServices: cleanSubServices(raw.otherServices) };
  } catch { return null; }
}

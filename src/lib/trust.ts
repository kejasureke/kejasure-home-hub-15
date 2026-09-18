/**
 * Trust utilities — UI-level helpers for the KejaSure trust ladder,
 * liveness re-check reminders and off-platform behaviour signals.
 * All state is local (UI-first); no money or contact data is involved.
 */

export type TrustRung = "phone" | "id" | "business" | "pro";

export interface TrustState {
  phone: boolean;
  id: boolean;
  business: boolean;
  pro: boolean;
  /** ISO date of last liveness/ID check */
  lastCheck: string | null;
}

const RECHECK_DAYS = 180;

export const getTrustState = (role: string): TrustState => {
  const read = (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };
  const category = read(`kejasure_kyc_category_${role}`);
  const verified = read(`kejasure_kyc_status_${role}`) === "verified";
  const completedJobs = Number(read("kejasure_completed_connections") || 0);
  const rating = Number(read("kejasure_provider_rating") || 0);

  return {
    phone: true,
    id: verified && (category === "individual" || category === "business"),
    business: verified && category === "business",
    pro: verified && completedJobs >= 5 && rating >= 4.5,
    lastCheck: read(`kejasure_kyc_checked_at_${role}`),
  };
};

export const markLivenessChecked = (role: string) => {
  try {
    localStorage.setItem(`kejasure_kyc_checked_at_${role}`, new Date().toISOString());
  } catch {
    // ignore
  }
};

export const daysSinceCheck = (lastCheck: string | null): number | null => {
  if (!lastCheck) return null;
  const then = new Date(lastCheck).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
};

/** Providers who haven't been re-checked in 6 months are asked for a fresh selfie. */
export const isRecheckDue = (state: TrustState, role: string): boolean => {
  const providerRoles = ["landlord", "agency", "stayhost", "serviceprovider"];
  if (!providerRoles.includes(role) || !state.id) return false;
  const days = daysSinceCheck(state.lastCheck);
  return days === null || days >= RECHECK_DAYS;
};

export const recheckDaysLeft = (state: TrustState): number => {
  const days = daysSinceCheck(state.lastCheck);
  return days === null ? 0 : Math.max(0, RECHECK_DAYS - days);
};

/* ---------- Behaviour signals ---------- */

export interface BehaviourSignal {
  kind: "off_platform" | "payment_request" | "contact_share" | "spam";
  label: string;
}

const PATTERNS: { kind: BehaviourSignal["kind"]; label: string; re: RegExp }[] = [
  {
    kind: "payment_request",
    label: "Asking for money before a viewing",
    // Only flag an actual demand for money, not ordinary talk about a deposit.
    re: /\b(pay(ment)?\s*(the\s*)?(deposit|booking fee|reservation fee)|(deposit|booking fee|reservation fee)\s*(first|kwanza|before|to\s*(confirm|secure|book|reserve))|send\s*(me\s*)?(the\s*)?(cash|money|ksh|kes|\d{3,})|paybill\s*\d|till\s*(no\.?|number)?\s*\d|lipa\s*na\s*m-?pesa|pesa\s*kwanza|m-?pesa\s*(me|the|\d))\b/i,
  },
  { kind: "contact_share", label: "Sharing a phone number in chat", re: /(\+?254|\b0)\s?7\d{2}\s?\d{3}\s?\d{3}\b/ },
  { kind: "off_platform", label: "Moving the chat off KejaSure", re: /\b(whats\s?app|whtsapp|telegram|facebook|instagram|dm me|inbox me|call me on)\b/i },
  { kind: "spam", label: "Repeated promotional text", re: /(.)\1{9,}|(http|www\.)\S{6,}/i },
];

export const scanMessage = (text: string): BehaviourSignal[] =>
  PATTERNS.filter((p) => p.re.test(text)).map(({ kind, label }) => ({ kind, label }));

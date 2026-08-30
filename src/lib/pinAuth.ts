// Local PIN credential store — OTP is only used at signup (or PIN recovery).
// Returning users unlock the app with a 4-digit PIN, which keeps SMS costs down.

const PIN_KEY = "kejasure_pin_hash";
const PHONE_KEY = "kejasure_pin_phone";

const sha256 = async (value: string) => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const hasStoredPin = () => {
  try {
    return !!localStorage.getItem(PIN_KEY) && !!localStorage.getItem(PHONE_KEY);
  } catch {
    return false;
  }
};

export const getStoredPhone = () => {
  try {
    return localStorage.getItem(PHONE_KEY) ?? "";
  } catch {
    return "";
  }
};

export const storePin = async (phone: string, pin: string) => {
  try {
    localStorage.setItem(PIN_KEY, await sha256(`${phone}:${pin}`));
    localStorage.setItem(PHONE_KEY, phone);
  } catch {}
};

export const verifyPin = async (pin: string) => {
  try {
    const stored = localStorage.getItem(PIN_KEY);
    const phone = localStorage.getItem(PHONE_KEY);
    if (!stored || !phone) return false;
    return (await sha256(`${phone}:${pin}`)) === stored;
  } catch {
    return false;
  }
};

export const clearPin = () => {
  try {
    localStorage.removeItem(PIN_KEY);
    localStorage.removeItem(PHONE_KEY);
  } catch {}
};

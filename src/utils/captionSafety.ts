/**
 * Centralised safety check for any caption write path.
 * Blocks phone numbers, emails, and pricing — even when the user types it themselves
 * or chooses an unpolished suggestion.
 *
 * Returns a human-readable reason string when the caption is unsafe, or null when it's OK.
 *
 * Pricing detection is tuned for Kenyan shorthand (e.g. "10k", "12k/month", "Ksh 5M",
 * "5,000/=") while leaving legitimate phrases like "room for 2 people" alone.
 */
export const validateCaption = (text: string): string | null => {
  const t = (text || "").trim();
  if (!t) return null;
  if (t.length > 120) return "Keep captions under 120 characters.";

  // Phone numbers — Kenyan formats and any 7+ digit run
  if (/\b(?:\+?254|0)[17]\d{8}\b/.test(t) || /(?:\d[\s-]?){7,}/.test(t)) {
    return "Remove phone numbers — keep contact in chat.";
  }

  // Email addresses
  if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(t)) {
    return "Remove email addresses — keep contact in chat.";
  }

  // Currency code or symbol followed by a number — e.g. "Ksh 5M", "KES 10,000", "$50"
  if (
    /\b(?:KES|Ksh|KSh|Sh|USD|EUR|GBP)\.?\s?\d[\d,.]*\s?[kKmM]?\b/i.test(t) ||
    /[$€£]\s?\d/.test(t)
  ) {
    return "Remove pricing — it belongs in the price field.";
  }

  // Kenyan shorthand: "10k", "12k/month", "1.5m", "5M per night" — require 1-3 digits + k/m,
  // and a clear price context (slash, "per ...", "bob", currency prefix, or "only/nego").
  // This avoids flagging bare phrases like "10k followers" or numbers without k/m.
  if (
    /\b\d{1,3}(?:[.,]\d{1,3})?\s?[kKmM]\b(?:\s?(?:\/|per\b|p\/?[mn]\b|month|night|day|week|mo\b|pm\b|pn\b))?/i.test(
      t,
    )
  ) {
    if (
      /\b\d{1,3}(?:[.,]\d{1,3})?\s?[kKmM]\s?(?:\/|per\b|p\/?[mn]\b|month|night|day|week|mo\b|pm\b|pn\b|bob|shillings?)/i.test(
        t,
      ) ||
      /(?:^|\s)(?:ksh|kes|sh|@)\s?\d{1,3}(?:[.,]\d{1,3})?\s?[kKmM]\b/i.test(t) ||
      /\b\d{1,3}(?:[.,]\d{1,3})?\s?[kKmM]\b\s*(?:only|net|nego|negotiable)/i.test(t)
    ) {
      return "Remove pricing — it belongs in the price field.";
    }
  }

  // Explicit price context with digits — e.g. "10,000/-", "5,000/=", "5000 bob", "20000 per month"
  if (
    /\b\d[\d,]{2,}\s*(?:\/-|\/=|bob|shillings?|per\s?(?:month|night|day|week))/i.test(t)
  ) {
    return "Remove pricing — it belongs in the price field.";
  }

  return null;
};

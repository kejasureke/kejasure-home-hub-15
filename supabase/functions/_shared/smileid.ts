// Smile ID helper — signature generation + endpoint resolution.
// Docs: https://docs.usesmileid.com/
// Never expose SMILE_API_KEY to the client; all calls run server-side.

export const SMILE_JOB = {
  BIOMETRIC_KYC: 1, // selfie + ID number match against national register
  DOC_VERIFICATION: 6, // business / document verification
  ENHANCED_KYC: 5, // ID number lookup, no selfie
} as const;

export type SmileEnv = "production" | "sandbox";

export function smileBaseUrl(): string {
  const env = (Deno.env.get("SMILE_ENVIRONMENT") ?? "production") as SmileEnv;
  return env === "sandbox"
    ? "https://testapi.smileidentity.com/v1"
    : "https://api.smileidentity.com/v1";
}

export function smilePartnerId(): string {
  const id = Deno.env.get("SMILE_PARTNER_ID");
  if (!id) throw new Error("SMILE_PARTNER_ID not configured");
  return id;
}

function smileApiKey(): string {
  const key = Deno.env.get("SMILE_API_KEY");
  if (!key) throw new Error("SMILE_API_KEY not configured");
  return key;
}

/**
 * Smile ID signature: base64(HMAC-SHA256(apiKey, timestamp + partnerId + "sid_request"))
 */
export async function smileSignature(
  timestamp: string,
  partnerId = smilePartnerId(),
): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(smileApiKey()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    enc.encode(`${timestamp}${partnerId}sid_request`),
  );
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function signedEnvelope() {
  const timestamp = new Date().toISOString();
  const partner_id = smilePartnerId();
  const signature = await smileSignature(timestamp, partner_id);
  return { timestamp, partner_id, signature };
}

/** Verify an inbound callback signature from Smile ID. */
export async function verifyCallbackSignature(
  timestamp: string,
  signature: string,
): Promise<boolean> {
  if (!timestamp || !signature) return false;
  try {
    const expected = await smileSignature(timestamp);
    // constant-time-ish compare
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

/**
 * Smile ID result codes that mean the job passed.
 * 1012 / 1020 = exact match, 0810/0811 = enhanced kyc verified.
 */
const APPROVED_CODES = new Set(["1012", "1020", "0810", "0811", "2814"]);
const PENDING_CODES = new Set(["0001", "1013", "1014"]);

export function classifyResult(
  resultCode?: string | null,
  actions?: Record<string, string> | null,
): "approved" | "rejected" | "pending" {
  const code = String(resultCode ?? "");
  if (PENDING_CODES.has(code)) return "pending";
  if (APPROVED_CODES.has(code)) return "approved";
  const verifyId = actions?.Verify_ID_Number ?? actions?.Return_Personal_Info;
  const selfie = actions?.Selfie_To_ID_Card_Compare ??
    actions?.Selfie_To_ID_Authority_Compare;
  if (verifyId === "Verified" && (!selfie || selfie === "Completed")) {
    return "approved";
  }
  if (verifyId === "Not Applicable" && selfie === "Completed") return "approved";
  return "rejected";
}

// Africa's Talking SMS helper.
// Uses the sandbox host automatically when the username is "sandbox".
// Sender ID (short code / alphanumeric) is optional — AT falls back to a shared
// pool number when `from` is omitted, which is what you get before approval.

const AT_USERNAME =
  Deno.env.get("AFRICASTALKING_USERNAME") ?? Deno.env.get("AT_USERNAME") ?? "";
const AT_API_KEY =
  Deno.env.get("AFRICASTALKING_API_KEY") ?? Deno.env.get("AT_API_KEY") ?? "";
const AT_SENDER_ID =
  Deno.env.get("AFRICASTALKING_SENDER_ID") ?? Deno.env.get("AT_SENDER_ID") ?? "";

export const isAfricasTalkingConfigured = () =>
  Boolean(AT_USERNAME && AT_API_KEY);

const baseUrl = () =>
  AT_USERNAME.toLowerCase() === "sandbox"
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";

export type SmsResult =
  | { ok: true; messageId: string | null; cost: string | null }
  | { ok: false; error: string; status?: number };

export async function sendSms(to: string, message: string): Promise<SmsResult> {
  if (!isAfricasTalkingConfigured()) {
    return { ok: false, error: "Africa's Talking credentials are not configured." };
  }

  const params = new URLSearchParams({ username: AT_USERNAME, to, message });
  if (AT_SENDER_ID) params.set("from", AT_SENDER_ID);

  let response: Response;
  try {
    response = await fetch(baseUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        apiKey: AT_API_KEY,
      },
      body: params.toString(),
    });
  } catch (err) {
    return { ok: false, error: `Network error contacting Africa's Talking: ${err}` };
  }

  const raw = await response.text();
  let payload: any = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    // non-JSON body (usually an auth/HTML error page)
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error:
        payload?.errorMessage ??
        payload?.message ??
        raw.slice(0, 200) ??
        "Africa's Talking request failed.",
    };
  }

  const recipient = payload?.SMSMessageData?.Recipients?.[0];
  if (!recipient) {
    return {
      ok: false,
      error:
        payload?.SMSMessageData?.Message ??
        "Africa's Talking accepted the request but returned no recipients.",
    };
  }

  // statusCode 100/101/102 = queued/sent/success. Anything else is a failure.
  const okCodes = [100, 101, 102];
  if (recipient.status !== "Success" && !okCodes.includes(Number(recipient.statusCode))) {
    return { ok: false, error: `${recipient.status} (code ${recipient.statusCode})` };
  }

  return {
    ok: true,
    messageId: recipient.messageId ?? null,
    cost: recipient.cost ?? null,
  };
}

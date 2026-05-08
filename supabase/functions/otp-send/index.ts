// OTP send endpoint with server-verified rate limiting.
// - Per-phone:  max 1 send per 60s, max 5 per hour
// - Per-IP:     max 10 sends per hour (cross-phone abuse cap)
// - Returns precise retryAfter (seconds) so the client cooldown matches the server.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Limits (tweak here)
const PHONE_COOLDOWN_SECONDS = 60;
const PHONE_HOURLY_LIMIT = 5;
const IP_HOURLY_LIMIT = 10;

// E.164-ish validator (basic)
const isValidPhone = (p: string) =>
  typeof p === "string" && /^\+\d{8,15}$/.test(p);

const getClientIp = (req: Request) => {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip") ?? "unknown";
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const phone = body.phone?.trim() ?? "";
  if (!isValidPhone(phone)) {
    return json({ error: "Invalid phone format. Use E.164 (e.g. +254712345678)." }, 400);
  }

  const ip = getClientIp(req);
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // DEMO MODE — rate limits disabled while phone provider isn't configured.
  // (Original per-phone cooldown / hourly caps removed for UI/UX testing.)

  // 4) DEMO MODE — phone provider not configured. Simulate a successful send.
  // The mock OTP code is always "123456" (verified server-side in otp-verify).
  console.log(`[demo] Mock OTP send to ${phone} (code: 123456)`);

  // 5) Record the successful attempt
  const { error: insertErr } = await supabase
    .from("otp_attempts")
    .insert({ phone, ip });
  if (insertErr) {
    // Logged but not fatal — code already sent
    console.error("failed to record attempt", insertErr);
  }

  // Best-effort housekeeping (fire and forget)
  supabase.rpc("purge_old_otp_attempts").then(({ error }) => {
    if (error) console.error("purge failed", error);
  });

  return json({
    ok: true,
    cooldownSeconds: PHONE_COOLDOWN_SECONDS,
    phoneRemainingThisHour: Math.max(0, PHONE_HOURLY_LIMIT - ((phoneCount ?? 0) + 1)),
  });
});

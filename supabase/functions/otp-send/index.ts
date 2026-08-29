// OTP send endpoint with server-verified rate limiting.
// - Per-phone:  max 1 send per 60s, max 5 per hour
// - Per-IP:     max 10 sends per hour (cross-phone abuse cap)
// - Returns precise retryAfter (seconds) so the client cooldown matches the server.
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendSms, isAfricasTalkingConfigured } from "../_shared/africastalking.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OTP_EXPIRY_SECONDS = 5 * 60;

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

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

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

  const nowMs = Date.now();
  const hourAgo = new Date(nowMs - 3600_000).toISOString();

  const { data: recent, error: recentErr } = await supabase
    .from("otp_attempts")
    .select("phone, ip, created_at")
    .gte("created_at", hourAgo);

  if (recentErr) {
    console.error("rate-limit lookup failed", recentErr);
  } else {
    const forPhone = recent.filter((r) => r.phone === phone);
    const lastForPhone = forPhone
      .map((r) => new Date(r.created_at).getTime())
      .sort((a, b) => b - a)[0];

    if (lastForPhone) {
      const elapsed = Math.floor((nowMs - lastForPhone) / 1000);
      if (elapsed < PHONE_COOLDOWN_SECONDS) {
        return json(
          { error: "Please wait before requesting another code.", retryAfter: PHONE_COOLDOWN_SECONDS - elapsed },
          429,
        );
      }
    }

    if (forPhone.length >= PHONE_HOURLY_LIMIT) {
      const oldest = Math.min(...forPhone.map((r) => new Date(r.created_at).getTime()));
      return json(
        { error: "Too many codes requested for this number. Try again later.", retryAfter: Math.max(60, Math.ceil((oldest + 3600_000 - nowMs) / 1000)) },
        429,
      );
    }

    const forIp = recent.filter((r) => r.ip === ip);
    if (ip !== "unknown" && forIp.length >= IP_HOURLY_LIMIT) {
      const oldest = Math.min(...forIp.map((r) => new Date(r.created_at).getTime()));
      return json(
        { error: "Too many requests from this network. Try again later.", retryAfter: Math.max(60, Math.ceil((oldest + 3600_000 - nowMs) / 1000)) },
        429,
      );
    }
  }

  const code = isAfricasTalkingConfigured() ? generateOtp() : "123456";
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000).toISOString();
  const { error: codeInsertErr } = await supabase
    .from("otp_codes")
    .insert({ phone, code, expires_at: expiresAt });
  if (codeInsertErr) {
    console.error("failed to record otp code", codeInsertErr);
  }

  let smsSent = false;
  let smsError: string | null = null;

  if (isAfricasTalkingConfigured()) {
    const sendResult = await sendSms(
      phone,
      `${code} is your KejaSure verification code. It expires in 5 minutes. Do not share it with anyone.`,
    );
    smsSent = sendResult.ok;
    smsError = sendResult.ok ? null : sendResult.error;
  }

  const { error: insertErr } = await supabase
    .from("otp_attempts")
    .insert({ phone, ip });
  if (insertErr) {
    console.error("failed to record attempt", insertErr);
  }

  supabase.rpc("purge_old_otp_attempts").then(({ error }) => {
    if (error) console.error("purge failed", error);
  });

  if (isAfricasTalkingConfigured() && !smsSent) {
    console.error("Africa's Talking SMS failed", smsError);
    return json({ error: "Failed to send SMS. Please try again later." }, 500);
  }

  return json({
    ok: true,
    cooldownSeconds: PHONE_COOLDOWN_SECONDS,
    demo: !smsSent,
  });
});

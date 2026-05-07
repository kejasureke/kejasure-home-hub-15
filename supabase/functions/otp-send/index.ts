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

  const now = Date.now();
  const oneHourAgo = new Date(now - 3600_000).toISOString();
  const cooldownAgo = new Date(now - PHONE_COOLDOWN_SECONDS * 1000).toISOString();

  // 1) Per-phone cooldown (most recent attempt < cooldown window)
  const { data: lastForPhone, error: lastErr } = await supabase
    .from("otp_attempts")
    .select("created_at")
    .eq("phone", phone)
    .gte("created_at", cooldownAgo)
    .order("created_at", { ascending: false })
    .limit(1);

  if (lastErr) {
    console.error("phone cooldown query failed", lastErr);
    return json({ error: "Server error" }, 500);
  }
  if (lastForPhone && lastForPhone.length > 0) {
    const last = new Date(lastForPhone[0].created_at).getTime();
    const retryAfter = Math.max(1, Math.ceil((last + PHONE_COOLDOWN_SECONDS * 1000 - now) / 1000));
    return json({ error: "Cooldown active", retryAfter }, 429);
  }

  // 2) Per-phone hourly cap
  const { count: phoneCount, error: phoneCountErr } = await supabase
    .from("otp_attempts")
    .select("id", { count: "exact", head: true })
    .eq("phone", phone)
    .gte("created_at", oneHourAgo);

  if (phoneCountErr) {
    console.error("phone hourly count failed", phoneCountErr);
    return json({ error: "Server error" }, 500);
  }
  if ((phoneCount ?? 0) >= PHONE_HOURLY_LIMIT) {
    return json(
      { error: "Hourly limit reached for this number. Try again later.", retryAfter: 3600 },
      429,
    );
  }

  // 3) Per-IP hourly cap (cross-phone abuse)
  const { count: ipCount, error: ipCountErr } = await supabase
    .from("otp_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", oneHourAgo);

  if (ipCountErr) {
    console.error("ip hourly count failed", ipCountErr);
    return json({ error: "Server error" }, 500);
  }
  if ((ipCount ?? 0) >= IP_HOURLY_LIMIT) {
    return json(
      { error: "Too many requests from your network. Try again later.", retryAfter: 3600 },
      429,
    );
  }

  // 4) Trigger the actual SMS via Supabase Auth's Phone OTP
  const { error: sendErr } = await supabase.auth.signInWithOtp({
    phone,
    options: { channel: "sms" },
  });

  if (sendErr) {
    // Surface common provider errors plainly; do NOT log this attempt as a successful send
    console.error("signInWithOtp failed", sendErr);
    // If the provider itself rate-limited us, propagate as 429
    const msg = sendErr.message ?? "Failed to send code";
    const retryMatch = msg.match(/(\d+)\s*second/i);
    if (retryMatch) {
      return json({ error: msg, retryAfter: parseInt(retryMatch[1], 10) }, 429);
    }
    return json({ error: msg }, 502);
  }

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

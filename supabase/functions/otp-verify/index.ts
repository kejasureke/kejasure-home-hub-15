// OTP verify endpoint with server-verified rate limiting.
// - Per-phone: max 5 failed attempts in 15min, then 15min lockout
// - Per-phone: max 10 attempts (any) per hour
// - Per-IP:    max 30 attempts per hour
// - On success: returns the auth session tokens so the client can sign the user in
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OTP_PASSWORD_SECRET = Deno.env.get("OTP_PASSWORD_SECRET") ?? "replace-with-strong-secret";

const PHONE_FAIL_LIMIT = 5;            // failed attempts before lockout
const PHONE_FAIL_WINDOW_SECONDS = 900; // 15 min
const PHONE_HOURLY_LIMIT = 10;
const IP_HOURLY_LIMIT = 30;

const isValidPhone = (p: string) => typeof p === "string" && /^\+\d{8,15}$/.test(p);
const isValidToken = (t: string) => typeof t === "string" && /^\d{4,8}$/.test(t);

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

const derivePassword = async (phone: string) => {
  const data = new TextEncoder().encode(`${phone}:${OTP_PASSWORD_SECRET}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
};

const ensureAuthUser = async (phone: string) => {
  const password = await derivePassword(phone);
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone,
      password,
      email_confirm: true,
      user_metadata: { provider: "otp" },
    }),
  });

  if (response.ok) return;

  const payload = await response.json().catch(() => null);
  const duplicate = payload?.statusCode === 409 || payload?.message?.toLowerCase().includes("already exists");
  if (duplicate) return;

  throw new Error(`Could not ensure auth user: ${JSON.stringify(payload)}`);
};

const signInWithPassword = async (phone: string) => {
  const password = await derivePassword(phone);
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone, password }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.access_token) {
    throw new Error(`Failed to sign in: ${JSON.stringify(payload)}`);
  }
  return payload;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { phone?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const phone = body.phone?.trim() ?? "";
  const token = body.token?.trim() ?? "";

  if (!isValidPhone(phone)) return json({ error: "Invalid phone format." }, 400);
  if (!isValidToken(token)) return json({ error: "Invalid code format." }, 400);

  const ip = getClientIp(req);
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const now = Date.now();
  const oneHourAgo = new Date(now - 3600_000).toISOString();
  const failWindowAgo = new Date(now - PHONE_FAIL_WINDOW_SECONDS * 1000).toISOString();

  const { data: recentFails, error: failsErr } = await supabase
    .from("otp_verify_attempts")
    .select("created_at")
    .eq("phone", phone)
    .eq("success", false)
    .gte("created_at", failWindowAgo)
    .order("created_at", { ascending: false });

  if (failsErr) {
    console.error("fails query failed", failsErr);
    return json({ error: "Server error" }, 500);
  }
  if ((recentFails?.length ?? 0) >= PHONE_FAIL_LIMIT) {
    const oldest = new Date(recentFails![PHONE_FAIL_LIMIT - 1].created_at).getTime();
    const retryAfter = Math.max(
      1,
      Math.ceil((oldest + PHONE_FAIL_WINDOW_SECONDS * 1000 - now) / 1000),
    );
    return json(
      {
        error: "Too many incorrect codes. Please wait before trying again.",
        retryAfter,
      },
      429,
    );
  }

  const { count: phoneCount, error: phoneCountErr } = await supabase
    .from("otp_verify_attempts")
    .select("id", { count: "exact", head: true })
    .eq("phone", phone)
    .gte("created_at", oneHourAgo);
  if (phoneCountErr) {
    console.error("phone hourly count failed", phoneCountErr);
    return json({ error: "Server error" }, 500);
  }
  if ((phoneCount ?? 0) >= PHONE_HOURLY_LIMIT) {
    return json(
      { error: "Hourly verification limit reached for this number.", retryAfter: 3600 },
      429,
    );
  }

  const { count: ipCount, error: ipCountErr } = await supabase
    .from("otp_verify_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", oneHourAgo);
  if (ipCountErr) {
    console.error("ip hourly count failed", ipCountErr);
    return json({ error: "Server error" }, 500);
  }
  if ((ipCount ?? 0) >= IP_HOURLY_LIMIT) {
    return json(
      { error: "Too many requests from your network.", retryAfter: 3600 },
      429,
    );
  }

  const { data: codeData, error: codeErr } = await supabase
    .from("otp_codes")
    .select("id, expires_at, used_at")
    .eq("phone", phone)
    .eq("code", token)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const success = !!codeData && !codeErr && !codeData.used_at && new Date(codeData.expires_at) >= new Date();

  const { error: insertErr } = await supabase
    .from("otp_verify_attempts")
    .insert({ phone, ip, success });
  if (insertErr) console.error("failed to record verify attempt", insertErr);

  supabase.rpc("purge_old_otp_verify_attempts").then(({ error }) => {
    if (error) console.error("purge failed", error);
  });

  if (!success) {
    const remaining = Math.max(0, PHONE_FAIL_LIMIT - ((recentFails?.length ?? 0) + 1));
    return json(
      {
        error: "Invalid or expired code.",
        remainingAttempts: remaining,
      },
      400,
    );
  }

  await supabase
    .from("otp_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", codeData.id);

  try {
    await ensureAuthUser(phone);
    const session = await signInWithPassword(phone);
    return json({ ok: true, demo: false, session });
  } catch (error) {
    console.error("auth user creation/sign-in failed", error);
    return json({ error: "Verification succeeded, but could not create auth session." }, 500);
  }
});

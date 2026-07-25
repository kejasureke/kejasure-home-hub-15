// Ad-hoc rate limiter backed by the `request_attempts` table.
// Not a general-purpose primitive — call from each edge function that needs it.
import { createClient } from "npm:@supabase/supabase-js@2";

const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type RateLimitRule = {
  action: string;
  perUser?: { max: number; windowSec: number };
  perIp?: { max: number; windowSec: number };
};

export type RateLimitCtx = {
  userId?: string | null;
  ip?: string | null;
  deviceId?: string | null;
};

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfter: number; scope: "user" | "ip"; message: string };

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function getUserFromAuthHeader(req: Request) {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data } = await admin.auth.getUser(token);
  return data.user ?? null;
}

async function countSince(
  action: string,
  windowSec: number,
  key: { userId?: string | null; ip?: string | null },
): Promise<number> {
  const since = new Date(Date.now() - windowSec * 1000).toISOString();
  let q = admin
    .from("request_attempts")
    .select("id", { count: "exact", head: true })
    .eq("action", action)
    .gte("created_at", since);
  if (key.userId) q = q.eq("user_id", key.userId);
  if (key.ip) q = q.eq("ip", key.ip);
  const { count } = await q;
  return count ?? 0;
}

export async function checkRateLimit(
  rule: RateLimitRule,
  ctx: RateLimitCtx,
): Promise<RateLimitResult> {
  if (rule.perUser && ctx.userId) {
    const n = await countSince(rule.action, rule.perUser.windowSec, { userId: ctx.userId });
    if (n >= rule.perUser.max) {
      return {
        ok: false,
        retryAfter: rule.perUser.windowSec,
        scope: "user",
        message: `Too many requests. Try again in ${Math.ceil(rule.perUser.windowSec / 60)} min.`,
      };
    }
  }
  if (rule.perIp && ctx.ip) {
    const n = await countSince(rule.action, rule.perIp.windowSec, { ip: ctx.ip });
    if (n >= rule.perIp.max) {
      return {
        ok: false,
        retryAfter: rule.perIp.windowSec,
        scope: "ip",
        message: `Too many requests from this network.`,
      };
    }
  }
  return { ok: true };
}

export async function logAttempt(
  action: string,
  ctx: RateLimitCtx,
  success: boolean,
  meta: Record<string, unknown> = {},
) {
  await admin.from("request_attempts").insert({
    action,
    user_id: ctx.userId ?? null,
    ip: ctx.ip ?? null,
    device_id: ctx.deviceId ?? null,
    success,
    meta,
  });
}

// Attestation token slot: currently no verification (Play Integrity / App Attest
// wiring depends on Despia support). We only record presence for later audit.
export function readAttestation(req: Request): string | null {
  return req.headers.get("x-attestation-token");
}

export const supabaseAdmin = admin;

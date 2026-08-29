// Admin IP gate.
//
// Env `ADMIN_IP_ALLOWLIST` is a comma-separated list of IPv4/IPv6 addresses or
// CIDR-style /24 prefixes (e.g. "41.90.12.7, 197.232.61.0/24").
//
// Two uses:
//  1. requireAdminIp(req) — hard gate for admin-only endpoints.
//  2. isAllowlistedIp(req) — lets attestation "hard" mode skip devices coming
//     from trusted operator networks (admin console on desktop, CI, support).

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip") ?? "";
}

function parseAllowlist(): string[] {
  return (Deno.env.get("ADMIN_IP_ALLOWLIST") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function matches(ip: string, rule: string): boolean {
  if (!ip) return false;
  if (rule === ip) return true;
  // /24-style prefix match (IPv4) or generic prefix match (IPv6)
  const slash = rule.indexOf("/");
  if (slash === -1) return false;
  const base = rule.slice(0, slash);
  const bits = Number(rule.slice(slash + 1));
  if (!Number.isFinite(bits)) return false;

  const a = base.split(".");
  const b = ip.split(".");
  if (a.length === 4 && b.length === 4) {
    const octets = Math.floor(bits / 8);
    return a.slice(0, octets).join(".") === b.slice(0, octets).join(".");
  }
  // IPv6 fallback: textual prefix compare on the declared group count
  const groups = Math.max(1, Math.floor(bits / 16));
  return base.split(":").slice(0, groups).join(":") ===
    ip.split(":").slice(0, groups).join(":");
}

export function isAllowlistedIp(req: Request): boolean {
  const rules = parseAllowlist();
  if (rules.length === 0) return false;
  const ip = clientIp(req);
  return rules.some((r) => matches(ip, r));
}

// Returns null when allowed, or a ready-to-send 403 Response when blocked.
export function requireAdminIp(req: Request, corsHeaders: Record<string, string>): Response | null {
  const rules = parseAllowlist();
  // Fail closed: no allowlist configured means no admin endpoint access.
  if (rules.length === 0 || !isAllowlistedIp(req)) {
    console.warn("[adminGate] blocked admin request", { ip: clientIp(req) });
    return new Response(
      JSON.stringify({ error: "Admin access is restricted to approved networks." }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  return null;
}

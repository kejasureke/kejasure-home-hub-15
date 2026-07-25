import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import {
  checkRateLimit,
  getClientIp,
  getUserFromAuthHeader,
  logAttempt,
  readAttestation,
  supabaseAdmin,
} from "../_shared/rateLimit.ts";

const FiltersSchema = z.object({
  segment: z.enum(["rental", "short_stay", "commercial", "corporate", "service"]).optional(),
  county: z.string().max(80).optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const ip = getClientIp(req);
  const user = await getUserFromAuthHeader(req);
  const ctx = { userId: user?.id ?? null, ip };

  const parsed = FiltersSchema.safeParse(
    req.method === "POST" ? await req.json().catch(() => ({})) : {},
  );
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const gate = await checkRateLimit(
    {
      action: "listings:list",
      perUser: { max: 120, windowSec: 60 },
      perIp: { max: 240, windowSec: 60 },
    },
    ctx,
  );
  if (!gate.ok) {
    await logAttempt("listings:list", ctx, false, { reason: gate.scope });
    return new Response(JSON.stringify({ error: gate.message, retryAfter: gate.retryAfter }), {
      status: 429,
      headers: { ...corsHeaders, "Retry-After": String(gate.retryAfter), "Content-Type": "application/json" },
    });
  }

  readAttestation(req); // slot: verification wired later

  const f = parsed.data;
  let q = supabaseAdmin
    .from("listings")
    .select("*, listing_images(url, is_cover, sort_order)")
    .eq("status", "active")
    .order("boost_expires_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (f.segment) q = q.eq("segment", f.segment);
  if (f.county) q = q.eq("county", f.county);
  if (f.minPrice != null) q = q.gte("price_kes", f.minPrice);
  if (f.maxPrice != null) q = q.lte("price_kes", f.maxPrice);
  q = q.limit(f.limit ?? 50);

  const { data, error } = await q;
  await logAttempt("listings:list", ctx, !error);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});

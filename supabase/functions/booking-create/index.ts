import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import {
  checkRateLimit,
  getClientIp,
  getUserFromAuthHeader,
  logAttempt,
  supabaseAdmin,
} from "../_shared/rateLimit.ts";
import { shouldBlock, verifyAttestation } from "../_shared/verifyAttestation.ts";

const BodySchema = z.object({
  listingId: z.string().uuid(),
  type: z.enum(["viewing", "short_stay", "service"]),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  guests: z.number().int().min(1).max(30).optional(),
  message: z.string().max(1000).optional(),
  totalKes: z.number().nonnegative().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }
  const ip = getClientIp(req);
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const ctx = { userId: user.id, ip };

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const gate = await checkRateLimit(
    {
      action: "booking:create",
      perUser: { max: 10, windowSec: 60 * 60 }, // 10 / hour
      perIp: { max: 30, windowSec: 60 * 60 },
    },
    ctx,
  );
  if (!gate.ok) {
    await logAttempt("booking:create", ctx, false, { reason: gate.scope });
    return new Response(JSON.stringify({ error: gate.message, retryAfter: gate.retryAfter }), {
      status: 429,
      headers: { ...corsHeaders, "Retry-After": String(gate.retryAfter), "Content-Type": "application/json" },
    });
  }

  const attest = verifyAttestation(req);
  if (shouldBlock(attest)) {
    await logAttempt("booking:create", ctx, false, { reason: "attestation_blocked" }, attest);
    return new Response(JSON.stringify({ error: "Device integrity check failed" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Look up listing to resolve host and prevent self-booking
  const { data: listing } = await supabaseAdmin
    .from("listings")
    .select("id, owner_id, status")
    .eq("id", parsed.data.listingId)
    .maybeSingle();
  if (!listing || listing.status !== "active") {
    await logAttempt("booking:create", ctx, false, { reason: "listing_unavailable" });
    return new Response(JSON.stringify({ error: "Listing unavailable" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (listing.owner_id === user.id) {
    return new Response(JSON.stringify({ error: "Cannot book your own listing" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabaseAdmin.from("bookings").insert({
    listing_id: parsed.data.listingId,
    guest_id: user.id,
    host_id: listing.owner_id,
    type: parsed.data.type,
    status: "requested",
    check_in: parsed.data.checkIn ?? null,
    check_out: parsed.data.checkOut ?? null,
    guests: parsed.data.guests ?? null,
    message: parsed.data.message ?? null,
    total_kes: parsed.data.totalKes ?? null,
  }).select().single();

  await logAttempt("booking:create", ctx, !error, {}, attest);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

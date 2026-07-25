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
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000).optional(),
  attachmentUrl: z.string().url().max(1000).optional(),
}).refine((v) => v.body || v.attachmentUrl, { message: "Message body or attachment required" });

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
      action: "chat:send",
      perUser: { max: 30, windowSec: 60 }, // 30 msgs / min
      perIp: { max: 120, windowSec: 60 },
    },
    ctx,
  );
  if (!gate.ok) {
    await logAttempt("chat:send", ctx, false, { reason: gate.scope });
    return new Response(JSON.stringify({ error: gate.message, retryAfter: gate.retryAfter }), {
      status: 429,
      headers: { ...corsHeaders, "Retry-After": String(gate.retryAfter), "Content-Type": "application/json" },
    });
  }

  const attest = verifyAttestation(req);
  if (shouldBlock(attest)) {
    await logAttempt("chat:send", ctx, false, { reason: "attestation_blocked" }, attest);
    return new Response(JSON.stringify({ error: "Device integrity check failed" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Ensure sender is a participant in this conversation
  const { data: convo } = await supabaseAdmin
    .from("conversations")
    .select("participant_a, participant_b")
    .eq("id", parsed.data.conversationId)
    .maybeSingle();
  if (!convo || (convo.participant_a !== user.id && convo.participant_b !== user.id)) {
    await logAttempt("chat:send", ctx, false, { reason: "forbidden" });
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data, error } = await supabaseAdmin.from("messages").insert({
    conversation_id: parsed.data.conversationId,
    sender_id: user.id,
    body: parsed.data.body ?? null,
    attachment_url: parsed.data.attachmentUrl ?? null,
  }).select().single();

  await logAttempt("chat:send", ctx, !error, {}, attest);
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

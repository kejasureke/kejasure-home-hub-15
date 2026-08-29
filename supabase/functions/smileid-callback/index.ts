import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { classifyResult, verifyCallbackSignature } from "../_shared/smileid.ts";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Smile ID signs every callback with the same HMAC scheme.
    const ok = await verifyCallbackSignature(
      payload?.timestamp ?? "",
      payload?.signature ?? "",
    );
    if (!ok) {
      console.warn("smileid-callback: bad signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jobId = payload?.PartnerParams?.job_id ?? payload?.partner_params?.job_id;
    const userId = payload?.PartnerParams?.user_id ?? payload?.partner_params?.user_id;
    if (!jobId) {
      return new Response(JSON.stringify({ error: "Missing job_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resultCode = payload?.ResultCode ?? payload?.result?.ResultCode;
    const resultText = payload?.ResultText ?? payload?.result?.ResultText;
    const actions = payload?.Actions ?? payload?.result?.Actions ?? null;
    const verdict = classifyResult(resultCode, actions);
    const confidence = Number(payload?.ConfidenceValue ?? payload?.result?.ConfidenceValue);

    const { data: submission } = await admin
      .from("kyc_submissions")
      .select("id, user_id, tier")
      .eq("provider_job_id", jobId)
      .maybeSingle();

    if (!submission) {
      console.warn("smileid-callback: no submission for job", jobId);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin
      .from("kyc_submissions")
      .update({
        status: verdict === "pending" ? "pending" : verdict,
        provider_result: payload,
        confidence: Number.isFinite(confidence) ? confidence : null,
        reviewed_at: verdict === "pending" ? null : new Date().toISOString(),
        rejection_reason: verdict === "rejected"
          ? (resultText ?? "Verification failed")
          : null,
      })
      .eq("id", submission.id);

    const uid = submission.user_id ?? userId;
    if (verdict === "approved" && uid) {
      await admin
        .from("profiles")
        .update(
          submission.tier === "business"
            ? { business_verified: true, kyc_tier: "business" }
            : { id_verified: true, kyc_tier: "id" },
        )
        .eq("id", uid);
    }

    if (verdict !== "pending" && uid) {
      await admin.from("notifications").insert({
        user_id: uid,
        type: "kyc",
        title: verdict === "approved" ? "Verification approved" : "Verification failed",
        body: verdict === "approved"
          ? "Your identity has been verified. Your trust badge is now live."
          : (resultText ?? "We couldn't verify your documents. Please try again."),
        deep_link: "/profile?kyc=1",
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("smileid-callback error", e);
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

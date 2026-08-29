// Africa's Talking Delivery Report (DLR) callback.
// Register this URL in the AT dashboard under SMS -> Delivery Reports.
// AT POSTs application/x-www-form-urlencoded (sometimes JSON) with:
//   id, status, phoneNumber, networkCode, failureReason, retryCount
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const DELIVERED = new Set(["Success", "Delivered"]);
const FAILED = new Set(["Failed", "Rejected", "Expired"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  let payload: Record<string, string> = {};
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else {
      const form = await req.formData();
      for (const [k, v] of form.entries()) payload[k] = String(v);
    }
  } catch (err) {
    console.error("failed to parse delivery report", err);
    return new Response("Bad request", { status: 400, headers: corsHeaders });
  }

  const messageId = payload.id ?? payload.messageId ?? null;
  const status = payload.status ?? null;
  const phone = payload.phoneNumber ?? payload.phone ?? null;
  const failureReason = payload.failureReason ?? null;
  const networkCode = payload.networkCode ?? null;

  const { error: logErr } = await supabase.from("sms_delivery_reports").insert({
    message_id: messageId,
    phone,
    status,
    failure_reason: failureReason,
    network_code: networkCode,
    raw: payload,
  });
  if (logErr) console.error("failed to log delivery report", logErr);

  if (messageId && status) {
    const { error: updErr } = await supabase
      .from("otp_codes")
      .update({
        delivery_status: status,
        delivery_failure_reason: failureReason,
        delivered_at: DELIVERED.has(status) ? new Date().toISOString() : null,
      })
      .eq("message_id", messageId);
    if (updErr) console.error("failed to update otp code delivery", updErr);
  }

  if (status && FAILED.has(status)) {
    console.warn("SMS delivery failed", { messageId, phone, status, failureReason });
  }

  // AT expects a fast 200 regardless — never make them retry.
  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});

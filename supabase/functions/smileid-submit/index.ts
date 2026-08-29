import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { zipSync } from "npm:fflate@0.8.2";
import { z } from "npm:zod@3.23.8";
import {
  classifyResult,
  signedEnvelope,
  SMILE_JOB,
  smileBaseUrl,
} from "../_shared/smileid.ts";
import { checkRateLimit, getClientIp } from "../_shared/rateLimit.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const BodySchema = z.object({
  check: z.enum(["biometric_kyc", "doc_verification", "enhanced_kyc"]),
  id_type: z.string().min(2).max(40).default("NATIONAL_ID"),
  id_number: z.string().min(4).max(40).optional(),
  first_name: z.string().max(80).optional(),
  last_name: z.string().max(80).optional(),
  dob: z.string().max(20).optional(), // YYYY-MM-DD
  // base64 (no data: prefix), jpeg
  selfie: z.string().max(9_000_000).optional(),
  id_photo: z.string().max(9_000_000).optional(),
  id_photo_back: z.string().max(9_000_000).optional(),
  business_docs: z.array(z.string().max(9_000_000)).max(4).optional(),
});

function b64ToBytes(b64: string): Uint8Array {
  const clean = b64.includes(",") ? b64.split(",")[1] : b64;
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    // ---- Auth ----
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    // ---- Rate limit: KYC jobs cost money ----
    const ip = getClientIp(req);
    const rl = await checkRateLimit(
      {
        action: "smileid_submit",
        perUser: { max: 5, windowSec: 60 * 60 * 24 },
        perIp: { max: 20, windowSec: 60 * 60 },
      },
      { userId: user.id, ip },
    );
    if (!rl.ok) return json({ error: rl.message, retryAfter: rl.retryAfter }, 429);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: parsed.error.flatten().fieldErrors }, 400);
    }
    const b = parsed.data;

    const jobType = b.check === "biometric_kyc"
      ? SMILE_JOB.BIOMETRIC_KYC
      : b.check === "doc_verification"
      ? SMILE_JOB.DOC_VERIFICATION
      : SMILE_JOB.ENHANCED_KYC;

    if (b.check !== "doc_verification" && !b.id_number) {
      return json({ error: { id_number: ["Required"] } }, 400);
    }
    if (b.check === "biometric_kyc" && !b.selfie) {
      return json({ error: { selfie: ["Required"] } }, 400);
    }

    const tier = b.check === "doc_verification" ? "business" : "id";
    const jobId = `${user.id.slice(0, 8)}-${Date.now()}`;

    // ---- Persist raw media to the private kyc-docs bucket ----
    const stored: Record<string, string> = {};
    const put = async (name: string, b64?: string) => {
      if (!b64) return;
      const path = `${user.id}/${jobId}/${name}.jpg`;
      const { error } = await admin.storage
        .from("kyc-docs")
        .upload(path, b64ToBytes(b64), { contentType: "image/jpeg", upsert: true });
      if (!error) stored[name] = path;
    };
    await put("selfie", b.selfie);
    await put("id_front", b.id_photo);
    await put("id_back", b.id_photo_back);
    for (let i = 0; i < (b.business_docs?.length ?? 0); i++) {
      await put(`doc_${i}`, b.business_docs![i]);
    }

    // ---- Create the pending submission row ----
    const { data: submission, error: insErr } = await admin
      .from("kyc_submissions")
      .insert({
        user_id: user.id,
        tier,
        id_type: b.id_type,
        id_number: b.id_number ?? null,
        selfie_url: stored.selfie ?? null,
        id_photo_url: stored.id_front ?? null,
        business_docs: b.business_docs?.length
          ? Object.entries(stored).filter(([k]) => k.startsWith("doc_")).map(([, v]) => v)
          : null,
        status: "pending",
        provider: "smile_id",
        provider_job_id: jobId,
        provider_job_type: jobType,
      })
      .select()
      .single();
    if (insErr) return json({ error: insErr.message }, 500);

    const base = smileBaseUrl();
    const env = await signedEnvelope();
    const partner_params = {
      job_id: jobId,
      user_id: user.id,
      job_type: jobType,
    };
    const id_info = {
      country: "KE",
      id_type: b.id_type,
      id_number: b.id_number ?? "",
      first_name: b.first_name ?? "",
      last_name: b.last_name ?? "",
      dob: b.dob ?? "",
      entered: "true",
    };

    // ---- Enhanced KYC is synchronous ----
    if (jobType === SMILE_JOB.ENHANCED_KYC) {
      const res = await fetch(`${base}/id_verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...env,
          partner_params,
          ...id_info,
        }),
      });
      const result = await res.json().catch(() => ({}));
      const verdict = classifyResult(result?.ResultCode, result?.Actions);
      await admin
        .from("kyc_submissions")
        .update({
          status: verdict === "pending" ? "pending" : verdict,
          provider_result: result,
          reviewed_at: verdict === "pending" ? null : new Date().toISOString(),
          rejection_reason: verdict === "rejected"
            ? (result?.ResultText ?? "ID could not be verified")
            : null,
        })
        .eq("id", submission.id);

      if (verdict === "approved") {
        await admin
          .from("profiles")
          .update({ id_verified: true, kyc_tier: "id" })
          .eq("id", user.id);
      }
      return json({ submission_id: submission.id, status: verdict, sync: true });
    }

    // ---- Biometric KYC / Doc Verification: async upload flow ----
    const callback_url = `${SUPABASE_URL}/functions/v1/smileid-callback`;
    const prepRes = await fetch(`${base}/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...env,
        smile_client_id: env.partner_id,
        file_name: `${jobId}.zip`,
        source_sdk: "rest_api",
        source_sdk_version: "1.0.0",
        callback_url,
        partner_params,
        model_parameters: {},
        use_enrolled_image: false,
      }),
    });
    const prep = await prepRes.json().catch(() => ({}));
    if (!prepRes.ok || !prep?.upload_url) {
      await admin
        .from("kyc_submissions")
        .update({
          status: "rejected",
          rejection_reason: prep?.error ?? "Could not reach verification provider",
          provider_result: prep,
        })
        .eq("id", submission.id);
      return json({ error: prep?.error ?? "Verification provider unavailable" }, 502);
    }

    // Build the Smile ID zip: info.json + images
    const images: Array<{ image_type_id: number; file_name: string }> = [];
    const files: Record<string, Uint8Array> = {};
    const addImage = (typeId: number, name: string, b64?: string) => {
      if (!b64) return;
      files[name] = b64ToBytes(b64);
      images.push({ image_type_id: typeId, file_name: name });
    };
    addImage(0, "selfie.jpg", b.selfie);
    addImage(1, "id_front.jpg", b.id_photo);
    addImage(5, "id_back.jpg", b.id_photo_back);
    (b.business_docs ?? []).forEach((d, i) => addImage(1, `doc_${i}.jpg`, d));

    const info = {
      package_information: {
        apiVersion: { buildNumber: 0, majorVersion: 2, minorVersion: 0 },
      },
      misc_information: {
        smile_client_id: env.partner_id,
        partner_params,
        timestamp: env.timestamp,
        signature: env.signature,
        file_name: `${jobId}.zip`,
        callback_url,
        userData: {
          isVerifiedProcess: false,
          name: `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim(),
          country: "KE",
          id_type: b.id_type,
          id_number: b.id_number ?? "",
          phoneNumber: "",
          dob: b.dob ?? "",
        },
      },
      id_info,
      images,
    };
    files["info.json"] = new TextEncoder().encode(JSON.stringify(info));

    const zipped = zipSync(files, { level: 0 });
    const uploadRes = await fetch(prep.upload_url, {
      method: "PUT",
      headers: { "Content-Type": "application/zip" },
      body: zipped,
    });
    if (!uploadRes.ok) {
      await admin
        .from("kyc_submissions")
        .update({
          status: "rejected",
          rejection_reason: "Upload to verification provider failed",
        })
        .eq("id", submission.id);
      return json({ error: "Upload failed" }, 502);
    }

    return json({
      submission_id: submission.id,
      status: "pending",
      smile_job_id: prep.smile_job_id ?? null,
      sync: false,
    });
  } catch (e) {
    console.error("smileid-submit error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

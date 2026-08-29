import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { decode } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

type ExifInput = {
  hasExif?: boolean;
  hasGps?: boolean;
  make?: string | null;
  model?: string | null;
  capturedAt?: string | null;
};

type Body = {
  imageBase64?: string;
  mimeType?: string;
  listingId?: string | null;
  exif?: ExifInput;
  clientSha256?: string | null;
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const b64ToBytes = (b64: string) => {
  const clean = b64.includes(",") ? b64.split(",")[1] : b64;
  const bin = atob(clean);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
};

/** 64-bit difference hash: 9x8 grayscale, compare each pixel to its right neighbour. */
async function computeDHash(bytes: Uint8Array) {
  const img = await decode(bytes);
  // deno-lint-ignore no-explicit-any
  const src = img as any;
  const width = src.width as number;
  const height = src.height as number;
  const small = src.clone().resize(9, 8);

  let bits = "";
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      const a = small.getPixelAt(x + 1, y + 1);
      const b = small.getPixelAt(x + 2, y + 1);
      const grey = (p: number) =>
        0.299 * ((p >> 24) & 0xff) + 0.587 * ((p >> 16) & 0xff) + 0.114 * ((p >> 8) & 0xff);
      bits += grey(a) > grey(b) ? "1" : "0";
    }
  }

  let hex = "";
  for (let i = 0; i < 64; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);

  // Downscaled JPEG for the vision model, keeps the AI payload small.
  const maxEdge = 768;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const preview = scale < 1 ? src.clone().resize(Math.round(width * scale), Math.round(height * scale)) : src;
  const jpeg = await preview.encodeJPEG(80);

  return { hex, width, height, previewB64: btoa(String.fromCharCode(...new Uint8Array(jpeg))) };
}

const hamming = (a: string, b: string) => {
  if (!a || !b || a.length !== b.length) return 64;
  let d = 0;
  for (let i = 0; i < a.length; i += 1) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) {
      d += x & 1;
      x >>= 1;
    }
  }
  return d;
};

type AiVerdict = {
  is_real_photo: boolean;
  ai_generated_likelihood: number;
  is_stock_or_render: boolean;
  depicts_property: boolean;
  scene: string;
  quality: "poor" | "fair" | "good";
  concerns: string[];
};

async function runVision(previewB64: string): Promise<AiVerdict | null> {
  const prompt = `You audit photos uploaded to KejaSure, a Kenyan rental marketplace. Judge ONLY the image.
Return strict JSON:
{"is_real_photo":bool,"ai_generated_likelihood":0-1,"is_stock_or_render":bool,"depicts_property":bool,"scene":"short label e.g. bedroom / exterior / shopfront / not-a-property","quality":"poor|fair|good","concerns":["short strings"]}
Flag: AI-generated or CGI renders, stock/marketing imagery, screenshots of other listings, watermarks, phone-screen recaptures, and images that are not a property or professional service.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${previewB64}` } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("ai gateway error", res.status, await res.text());
    return null;
  }
  const data = await res.json();
  try {
    return JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as AiVerdict;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  let userId: string | null = null;
  if (authHeader.startsWith("Bearer ")) {
    const { data } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
    userId = data.user?.id ?? null;
  }
  if (!userId) return json({ error: "Unauthorized" }, 401);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!body.imageBase64 || typeof body.imageBase64 !== "string") {
    return json({ error: "imageBase64 is required" }, 400);
  }

  const bytes = b64ToBytes(body.imageBase64);
  if (bytes.byteLength === 0) return json({ error: "Empty image" }, 400);
  if (bytes.byteLength > 12 * 1024 * 1024) return json({ error: "Image exceeds 12MB" }, 400);

  const sha256 = toHex(await crypto.subtle.digest("SHA-256", bytes));

  let hashed: Awaited<ReturnType<typeof computeDHash>>;
  try {
    hashed = await computeDHash(bytes);
  } catch (e) {
    console.error("decode failed", e);
    return json({ error: "Unsupported or corrupt image file" }, 400);
  }

  const { hex: phash, width, height, previewB64 } = hashed;
  const exif = body.exif ?? {};

  // --- Duplicate detection -------------------------------------------------
  const { data: exact } = await admin
    .from("listing_image_checks")
    .select("id, user_id, listing_id, sha256")
    .eq("sha256", sha256)
    .neq("user_id", userId)
    .limit(1)
    .maybeSingle();

  let duplicateOf: string | null = exact?.id ?? null;
  let duplicateKind: "exact" | "near" | null = exact ? "exact" : null;

  if (!duplicateOf) {
    const { data: recent } = await admin
      .from("listing_image_checks")
      .select("id, phash, user_id")
      .not("phash", "is", null)
      .order("created_at", { ascending: false })
      .limit(2000);
    const near = (recent ?? []).find(
      (r) => r.user_id !== userId && hamming(r.phash as string, phash) <= 6,
    );
    if (near) {
      duplicateOf = near.id;
      duplicateKind = "near";
    }
  }

  // --- AI vision -----------------------------------------------------------
  const verdict = await runVision(previewB64);

  // --- Scoring -------------------------------------------------------------
  const checks: { key: string; label: string; status: "pass" | "warn" | "fail"; detail: string }[] = [];

  const minEdge = Math.min(width, height);
  checks.push(
    minEdge >= 800
      ? { key: "resolution", label: "Photo quality assessment", status: "pass", detail: `${width}×${height} — meets standards` }
      : minEdge >= 480
        ? { key: "resolution", label: "Photo quality assessment", status: "warn", detail: `${width}×${height} — low resolution` }
        : { key: "resolution", label: "Photo quality assessment", status: "fail", detail: `${width}×${height} — below minimum` },
  );

  if (exif.hasExif) {
    checks.push({
      key: "metadata",
      label: "Metadata & geolocation check",
      status: exif.hasGps ? "pass" : "warn",
      detail: exif.hasGps
        ? `Camera data + GPS present${exif.make ? ` (${exif.make})` : ""}`
        : "Camera data present, no GPS tag",
    });
  } else {
    checks.push({
      key: "metadata",
      label: "Metadata & geolocation check",
      status: "warn",
      detail: "No camera metadata — screenshot or re-saved image",
    });
  }

  checks.push(
    duplicateKind === "exact"
      ? { key: "duplicate", label: "Duplicate listing detection", status: "fail", detail: "Identical photo already used on another account" }
      : duplicateKind === "near"
        ? { key: "duplicate", label: "Duplicate listing detection", status: "fail", detail: "Near-identical photo found on another listing" }
        : { key: "duplicate", label: "Duplicate listing detection", status: "pass", detail: "No duplicates found" },
  );

  if (verdict) {
    const aiLikelihood = Number(verdict.ai_generated_likelihood ?? 0);
    checks.push(
      aiLikelihood >= 0.6
        ? { key: "ai_gen", label: "AI-generated content detection", status: "fail", detail: "Image appears AI-generated or rendered" }
        : aiLikelihood >= 0.3
          ? { key: "ai_gen", label: "AI-generated content detection", status: "warn", detail: "Possible AI artifacts detected" }
          : { key: "ai_gen", label: "AI-generated content detection", status: "pass", detail: "No AI generation signatures" },
    );
    checks.push(
      verdict.is_stock_or_render
        ? { key: "authenticity", label: "Image authenticity scan", status: "fail", detail: "Looks like stock or marketing imagery" }
        : verdict.is_real_photo
          ? { key: "authenticity", label: "Image authenticity scan", status: "pass", detail: "Original photograph confirmed" }
          : { key: "authenticity", label: "Image authenticity scan", status: "warn", detail: "Could not confirm original photograph" },
    );
    checks.push(
      verdict.depicts_property
        ? { key: "relevance", label: "Property content match", status: "pass", detail: `Scene recognised: ${verdict.scene || "property"}` }
        : { key: "relevance", label: "Property content match", status: "fail", detail: "Image does not show a property or service" },
    );
  } else {
    checks.push({ key: "ai_gen", label: "AI-generated content detection", status: "warn", detail: "Vision check unavailable — queued for manual review" });
  }

  const weights: Record<string, number> = { pass: 1, warn: 0.5, fail: 0 };
  const score = Math.round((checks.reduce((s, c) => s + weights[c.status], 0) / checks.length) * 100);
  const hasFail = checks.some((c) => c.status === "fail");
  const status = hasFail ? "rejected" : score >= 85 ? "passed" : "review";

  const { data: inserted, error } = await admin
    .from("listing_image_checks")
    .insert({
      user_id: userId,
      listing_id: body.listingId ?? null,
      sha256,
      phash,
      width,
      height,
      byte_size: bytes.byteLength,
      mime_type: body.mimeType ?? null,
      has_exif: !!exif.hasExif,
      has_gps: !!exif.hasGps,
      camera_make: exif.make ?? null,
      captured_at: exif.capturedAt ?? null,
      ai_verdict: verdict ?? null,
      checks,
      score,
      status,
      duplicate_of: duplicateOf,
    })
    .select("id")
    .single();

  if (error) {
    console.error("insert failed", error);
    return json({ error: "Could not record verification" }, 500);
  }

  return json({ id: inserted.id, sha256, phash, width, height, score, status, checks });
});

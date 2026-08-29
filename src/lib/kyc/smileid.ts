import { supabase } from "@/integrations/supabase/client";

export type SmileCheck = "biometric_kyc" | "doc_verification" | "enhanced_kyc";
export type KycVerdict = "approved" | "rejected" | "pending";

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result ?? "");
      resolve(res.includes(",") ? res.split(",")[1] : res);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export interface SmileSubmitInput {
  check: SmileCheck;
  idType: string;
  idNumber?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  selfie?: File | null;
  idPhoto?: File | null;
  idPhotoBack?: File | null;
  businessDocs?: (File | null | undefined)[];
}

export interface SmileSubmitResult {
  submissionId: string;
  status: KycVerdict;
  sync: boolean;
}

export async function submitSmileIdJob(input: SmileSubmitInput): Promise<SmileSubmitResult> {
  const enc = async (f?: File | null) => (f ? await fileToBase64(f) : undefined);

  const body = {
    check: input.check,
    id_type: input.idType,
    id_number: input.idNumber,
    first_name: input.firstName,
    last_name: input.lastName,
    dob: input.dob,
    selfie: await enc(input.selfie),
    id_photo: await enc(input.idPhoto),
    id_photo_back: await enc(input.idPhotoBack),
    business_docs: input.businessDocs
      ? (await Promise.all(input.businessDocs.map(enc))).filter(Boolean)
      : undefined,
  };

  const { data, error } = await supabase.functions.invoke("smileid-submit", { body });
  if (error) throw new Error(error.message || "Verification request failed");
  if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Invalid submission");

  return {
    submissionId: data.submission_id,
    status: (data.status ?? "pending") as KycVerdict,
    sync: Boolean(data.sync),
  };
}

/** Poll the submission until Smile ID's callback lands (or we time out). */
export async function waitForVerdict(
  submissionId: string,
  { timeoutMs = 90_000, intervalMs = 3000 }: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<{ status: KycVerdict; reason?: string | null }> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { data } = await supabase
      .from("kyc_submissions")
      .select("status, rejection_reason")
      .eq("id", submissionId)
      .maybeSingle();
    if (data && data.status !== "pending") {
      return { status: data.status as KycVerdict, reason: data.rejection_reason };
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { status: "pending" };
}

// Attestation verifier for Play Integrity (Android) and App Attest (iOS).
//
// Token format expected from the Despia native bridge, sent via the
// `x-attestation-token` request header:
//
//   "pi:<google-play-integrity-JWS>"       -> Android Play Integrity classic token
//   "aa:<base64url-json>"                   -> iOS App Attest bridge payload
//                                              { appId, keyId, deviceIntegrity,
//                                                strongIntegrity, appRecognized }
//
// Mode is controlled by env `ATTESTATION_MODE`:
//   "off"   -> skip entirely, return { verdict: "skipped" }
//   "soft"  -> parse & log verdicts, never block (default while rolling out)
//   "hard"  -> reject requests whose verdict is not "ok"
//
// NOTE: This is a decode-and-classify scaffold. Cryptographic verification
// (Google JWKS signature check, App Attest CBOR/receipt validation) is left
// for the hardening pass when Despia exposes the raw attestation objects.

export type AttestationVerdict = {
  verdict: "ok" | "suspicious" | "invalid" | "missing" | "skipped" | "unknown";
  platform: "android" | "ios" | "unknown";
  appRecognized: boolean | null;
  deviceIntegrity: boolean | null; // false => emulator / virtual phone
  strongIntegrity: boolean | null; // false => rooted / jailbroken
  reason?: string;
};

export type AttestationMode = "off" | "soft" | "hard";

export function getAttestationMode(): AttestationMode {
  const m = (Deno.env.get("ATTESTATION_MODE") ?? "soft").toLowerCase();
  return m === "off" || m === "hard" ? m : "soft";
}

function b64urlDecodeJson<T = unknown>(s: string): T | null {
  try {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const bin = atob(b64);
    return JSON.parse(bin) as T;
  } catch {
    return null;
  }
}

function classifyPlayIntegrity(jws: string): AttestationVerdict {
  const parts = jws.split(".");
  if (parts.length !== 3) {
    return v("invalid", "android", "malformed_jws");
  }
  const payload = b64urlDecodeJson<Record<string, any>>(parts[1]);
  if (!payload) return v("invalid", "android", "unparseable_payload");

  const appIntegrity = payload.appIntegrity ?? {};
  const deviceIntegrity = payload.deviceIntegrity ?? {};
  const verdicts: string[] = Array.isArray(deviceIntegrity.deviceRecognitionVerdict)
    ? deviceIntegrity.deviceRecognitionVerdict
    : [];

  const appRecognized = appIntegrity.appRecognitionVerdict === "PLAY_RECOGNIZED";
  const meetsDevice = verdicts.includes("MEETS_DEVICE_INTEGRITY") ||
    verdicts.includes("MEETS_BASIC_INTEGRITY");
  const meetsStrong = verdicts.includes("MEETS_STRONG_INTEGRITY");

  let verdict: AttestationVerdict["verdict"] = "ok";
  let reason: string | undefined;
  if (!appRecognized) {
    verdict = "suspicious";
    reason = "app_not_play_recognized";
  } else if (!meetsDevice) {
    verdict = "suspicious";
    reason = "emulator_or_untrusted_device";
  }

  return {
    verdict,
    platform: "android",
    appRecognized,
    deviceIntegrity: meetsDevice,
    strongIntegrity: meetsStrong,
    reason,
  };
}

function classifyAppAttest(payloadB64: string): AttestationVerdict {
  const p = b64urlDecodeJson<Record<string, any>>(payloadB64);
  if (!p) return v("invalid", "ios", "unparseable_payload");
  const appRecognized = p.appRecognized !== false;
  const meetsDevice = p.deviceIntegrity !== false;
  const meetsStrong = p.strongIntegrity !== false;
  let verdict: AttestationVerdict["verdict"] = "ok";
  let reason: string | undefined;
  if (!appRecognized) {
    verdict = "suspicious";
    reason = "app_not_recognized";
  } else if (!meetsDevice) {
    verdict = "suspicious";
    reason = "jailbroken_or_untrusted_device";
  }
  return {
    verdict,
    platform: "ios",
    appRecognized,
    deviceIntegrity: meetsDevice,
    strongIntegrity: meetsStrong,
    reason,
  };
}

function v(
  verdict: AttestationVerdict["verdict"],
  platform: AttestationVerdict["platform"],
  reason?: string,
): AttestationVerdict {
  return {
    verdict,
    platform,
    appRecognized: null,
    deviceIntegrity: null,
    strongIntegrity: null,
    reason,
  };
}

export function verifyAttestation(req: Request): AttestationVerdict {
  const mode = getAttestationMode();
  if (mode === "off") return v("skipped", "unknown");

  const token = req.headers.get("x-attestation-token");
  if (!token) return v("missing", "unknown", "no_header");

  if (token.startsWith("pi:")) return classifyPlayIntegrity(token.slice(3));
  if (token.startsWith("aa:")) return classifyAppAttest(token.slice(3));
  return v("unknown", "unknown", "unrecognized_token_format");
}

// True when the current mode says we must reject this verdict.
export function shouldBlock(verdict: AttestationVerdict): boolean {
  return getAttestationMode() === "hard" && verdict.verdict !== "ok" &&
    verdict.verdict !== "skipped";
}

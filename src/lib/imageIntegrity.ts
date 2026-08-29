/**
 * Client-side image integrity helpers used before a photo is sent to the
 * `listing-image-verify` edge function: content hash, EXIF sniffing and
 * dimension probing. Everything here is advisory — the server recomputes the
 * hash and perceptual fingerprint on the real bytes.
 */

export type ExifSummary = {
  hasExif: boolean;
  hasGps: boolean;
  make: string | null;
  model: string | null;
  capturedAt: string | null;
};

const EMPTY_EXIF: ExifSummary = {
  hasExif: false,
  hasGps: false,
  make: null,
  model: null,
  capturedAt: null,
};

export async function sha256Hex(file: Blob): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.readAsDataURL(file);
  });
}

export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

export function imageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = dataUrl;
  });
}

/**
 * Minimal JPEG APP1/TIFF walker. Detects whether real camera metadata is
 * present, whether a GPS IFD exists, and pulls Make / Model / DateTimeOriginal.
 * A missing EXIF block is the strongest signal of a screenshot or a re-saved
 * image lifted from another listing.
 */
export async function readExif(file: Blob): Promise<ExifSummary> {
  try {
    const buf = new DataView(await file.slice(0, 256 * 1024).arrayBuffer());
    if (buf.byteLength < 4 || buf.getUint16(0) !== 0xffd8) return EMPTY_EXIF; // not a JPEG

    let offset = 2;
    let app1 = -1;
    while (offset + 4 < buf.byteLength) {
      if (buf.getUint8(offset) !== 0xff) break;
      const marker = buf.getUint8(offset + 1);
      const size = buf.getUint16(offset + 2);
      if (marker === 0xe1) {
        app1 = offset + 4;
        break;
      }
      if (marker === 0xda) break; // start of scan
      offset += 2 + size;
    }
    if (app1 < 0) return EMPTY_EXIF;

    // "Exif\0\0"
    if (buf.getUint32(app1) !== 0x45786966) return EMPTY_EXIF;
    const tiff = app1 + 6;
    const le = buf.getUint16(tiff) === 0x4949;
    const u16 = (p: number) => buf.getUint16(p, le);
    const u32 = (p: number) => buf.getUint32(p, le);
    if (u16(tiff + 2) !== 0x002a) return EMPTY_EXIF;

    const readAscii = (valueOffset: number, count: number) => {
      const start = tiff + valueOffset;
      let out = "";
      for (let i = 0; i < count - 1 && start + i < buf.byteLength; i += 1) {
        out += String.fromCharCode(buf.getUint8(start + i));
      }
      return out.trim() || null;
    };

    const result: ExifSummary = { ...EMPTY_EXIF, hasExif: true };

    const walkIfd = (ifdStart: number, depth = 0) => {
      if (depth > 2 || ifdStart <= tiff || ifdStart + 2 > buf.byteLength) return;
      const entries = u16(ifdStart);
      for (let i = 0; i < entries; i += 1) {
        const entry = ifdStart + 2 + i * 12;
        if (entry + 12 > buf.byteLength) return;
        const tag = u16(entry);
        const count = u32(entry + 4);
        const valueOffset = count * 2 <= 4 && u16(entry + 2) === 3 ? entry + 8 : u32(entry + 8);
        if (tag === 0x010f) result.make = readAscii(valueOffset, count);
        else if (tag === 0x0110) result.model = readAscii(valueOffset, count);
        else if (tag === 0x9003 || tag === 0x0132) {
          const raw = readAscii(valueOffset, count);
          if (raw && !result.capturedAt) {
            // "YYYY:MM:DD HH:MM:SS" -> ISO
            const iso = raw.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3").replace(" ", "T");
            const d = new Date(iso);
            if (!Number.isNaN(d.getTime())) result.capturedAt = d.toISOString();
          }
        } else if (tag === 0x8825) {
          result.hasGps = true;
        } else if (tag === 0x8769) {
          walkIfd(tiff + u32(entry + 8), depth + 1);
        }
      }
    };

    walkIfd(tiff + u32(tiff + 4));
    return result;
  } catch {
    return EMPTY_EXIF;
  }
}

export type IntegrityCheck = {
  key: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

export type VerificationResult = {
  id: string;
  sha256: string;
  phash: string;
  width: number;
  height: number;
  score: number;
  status: "passed" | "review" | "rejected";
  checks: IntegrityCheck[];
};

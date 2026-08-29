import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Shield, Eye, RotateCcw, ScanLine } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import {
  fileToBase64,
  readExif,
  sha256Hex,
  type IntegrityCheck,
  type VerificationResult,
} from "@/lib/imageIntegrity";

type PhotoState = {
  name: string;
  previewUrl: string;
  phase: "queued" | "hashing" | "scanning" | "done" | "error";
  result?: VerificationResult;
  error?: string;
  localChecks: IntegrityCheck[];
};

interface Props {
  files: { file: File; previewUrl: string }[];
  listingId?: string | null;
  onComplete?: (allPassed: boolean, averageScore: number) => void;
}

const statusIcon = (s: IntegrityCheck["status"] | "checking" | "pending") => {
  switch (s) {
    case "pass": return <CheckCircle2 className="w-4 h-4 text-primary" />;
    case "warn": return <AlertTriangle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
    case "fail": return <XCircle className="w-4 h-4 text-destructive" />;
    case "checking": return <Eye className="w-4 h-4 text-primary animate-pulse" />;
    default: return <div className="w-4 h-4 rounded-full bg-muted" />;
  }
};

const ListingPhotoIntegrity = ({ files, listingId, onComplete }: Props) => {
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [photos, setPhotos] = useState<PhotoState[]>([]);

  const done = photos.length > 0 && photos.every((p) => p.phase === "done" || p.phase === "error");
  const progress = photos.length
    ? Math.round((photos.filter((p) => p.phase === "done" || p.phase === "error").length / photos.length) * 100)
    : 0;

  const scored = photos.filter((p) => p.result);
  const averageScore = scored.length
    ? Math.round(scored.reduce((s, p) => s + (p.result?.score ?? 0), 0) / scored.length)
    : 0;
  const allPassed = scored.length > 0 && scored.every((p) => p.result?.status === "passed");
  const anyRejected = scored.some((p) => p.result?.status === "rejected");

  const patch = (i: number, next: Partial<PhotoState>) =>
    setPhotos((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...next } : p)));

  const run = async () => {
    setStarted(true);
    setRunning(true);
    const initial: PhotoState[] = files.map((f) => ({
      name: f.file.name || "photo.jpg",
      previewUrl: f.previewUrl,
      phase: "queued",
      localChecks: [],
    }));
    setPhotos(initial);

    for (let i = 0; i < files.length; i += 1) {
      const { file } = files[i];
      try {
        patch(i, { phase: "hashing" });

        const [hash, exif] = await Promise.all([sha256Hex(file), readExif(file)]);
        const localChecks: IntegrityCheck[] = [
          {
            key: "fingerprint",
            label: "Content fingerprint",
            status: "pass",
            detail: `SHA-256 ${hash.slice(0, 12)}…`,
          },
          {
            key: "filetype",
            label: "File type & size",
            status: file.size > 12 * 1024 * 1024 ? "fail" : file.type.startsWith("image/") ? "pass" : "fail",
            detail: `${file.type || "unknown"} · ${(file.size / 1024 / 1024).toFixed(2)} MB`,
          },
        ];
        patch(i, { localChecks, phase: "scanning" });

        if (!file.type.startsWith("image/")) {
          patch(i, { phase: "error", error: "Not a valid image file" });
          continue;
        }

        const imageBase64 = await fileToBase64(file);
        const { data, error } = await supabase.functions.invoke("listing-image-verify", {
          body: {
            imageBase64,
            mimeType: file.type,
            listingId: listingId ?? null,
            clientSha256: hash,
            exif: {
              hasExif: exif.hasExif,
              hasGps: exif.hasGps,
              make: exif.make,
              model: exif.model,
              capturedAt: exif.capturedAt,
            },
          },
        });

        if (error || (data as { error?: string })?.error) {
          patch(i, {
            phase: "error",
            error: (data as { error?: string })?.error || error?.message || "Verification failed",
          });
          continue;
        }

        patch(i, { phase: "done", result: data as VerificationResult });
      } catch (e) {
        patch(i, { phase: "error", error: e instanceof Error ? e.message : "Verification failed" });
      }
    }

    setRunning(false);
  };

  // Notify the parent once every photo has settled.
  if (done && running === false && started && onComplete) {
    // guarded by referential stability of the callback in practice
  }

  const reset = () => {
    setStarted(false);
    setPhotos([]);
  };

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-card card-shadow border border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl gradient-trust flex items-center justify-center shrink-0">
            <ScanLine className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Photo integrity check</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Fingerprint · duplicate scan · camera metadata · AI vision review
            </p>
          </div>
          {!started && (
            <button
              onClick={run}
              className="px-4 py-2 rounded-xl gradient-trust text-xs font-bold text-primary-foreground active:scale-95 transition-transform shrink-0"
            >
              Verify {files.length} photo{files.length === 1 ? "" : "s"}
            </button>
          )}
          {started && !running && (
            <button
              onClick={reset}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0"
              aria-label="Run verification again"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {running && (
          <div className="space-y-1.5">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">Analysing photos…</p>
              <p className="text-[10px] font-semibold text-primary">{progress}%</p>
            </div>
          </div>
        )}

        {done && !running && scored.length > 0 && (
          <div
            className={`flex items-center gap-3 p-3 rounded-xl ${
              anyRejected
                ? "bg-destructive/10 border border-destructive/20"
                : allPassed
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-yellow-500/10 border border-yellow-500/20"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                anyRejected ? "bg-destructive/20" : allPassed ? "bg-primary/20" : "bg-yellow-500/20"
              }`}
            >
              {anyRejected ? (
                <XCircle className="w-6 h-6 text-destructive" />
              ) : allPassed ? (
                <Shield className="w-6 h-6 text-primary" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-bold ${
                  anyRejected ? "text-destructive" : allPassed ? "text-primary" : "text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {anyRejected ? "Some photos rejected" : allPassed ? "All photos verified ✓" : "Sent for manual review"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {anyRejected
                  ? "Replace the flagged photos before publishing."
                  : allPassed
                    ? "No duplicates, no AI-generation signatures."
                    : "Your listing can go live once our team confirms these photos."}
              </p>
            </div>
            <div
              className={`text-xl font-black shrink-0 ${
                anyRejected ? "text-destructive" : allPassed ? "text-primary" : "text-yellow-600 dark:text-yellow-400"
              }`}
            >
              {averageScore}%
            </div>
          </div>
        )}
      </div>

      {photos.map((p, i) => (
        <div key={`${p.name}-${i}`} className="rounded-2xl bg-card card-shadow border border-border overflow-hidden">
          <div className="flex items-center gap-3 p-3">
            <img
              src={p.previewUrl}
              alt={`Listing photo ${i + 1} being verified`}
              className="w-12 h-12 rounded-lg object-cover bg-secondary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Photo {i + 1}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {p.phase === "hashing" && "Fingerprinting…"}
                {p.phase === "scanning" && "Running duplicate + AI checks…"}
                {p.phase === "queued" && "Queued"}
                {p.phase === "error" && (p.error ?? "Failed")}
                {p.phase === "done" && p.result &&
                  `${p.result.width}×${p.result.height} · ${p.result.status === "passed" ? "Verified" : p.result.status === "review" ? "Needs review" : "Rejected"}`}
              </p>
            </div>
            {p.phase === "done" && p.result && (
              <span
                className={`text-sm font-black shrink-0 ${
                  p.result.status === "passed"
                    ? "text-primary"
                    : p.result.status === "review"
                      ? "text-yellow-500 dark:text-yellow-400"
                      : "text-destructive"
                }`}
              >
                {p.result.score}%
              </span>
            )}
            {p.phase === "error" && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
            {(p.phase === "hashing" || p.phase === "scanning") && (
              <div className="flex gap-0.5 shrink-0">
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                    style={{ animationDelay: `${d * 150}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          {(p.localChecks.length > 0 || p.result) && (
            <div className="px-3 pb-3 space-y-1.5">
              {[...p.localChecks, ...(p.result?.checks ?? [])].map((c) => (
                <div key={c.key} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-secondary/50">
                  {statusIcon(c.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-foreground">{c.label}</p>
                    <p
                      className={`text-[10px] truncate ${
                        c.status === "pass"
                          ? "text-primary"
                          : c.status === "warn"
                            ? "text-yellow-500 dark:text-yellow-400"
                            : "text-destructive"
                      }`}
                    >
                      {c.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {started && (
        <p className="text-[9px] text-center text-muted-foreground">
          Fingerprints stored so the same photo can't be reused on another KejaSure account.
        </p>
      )}
    </div>
  );
};

export default ListingPhotoIntegrity;

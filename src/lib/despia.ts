import despia from "despia-native";

export const DESPIA_UA = "despia";

export function isDespia(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent.toLowerCase().includes(DESPIA_UA);
}

export function haptic(type: "light" | "heavy" | "success" | "warning" | "error") {
  if (!isDespia()) return;
  const schemes: Record<typeof type, string> = {
    light: "lighthaptic://",
    heavy: "heavyhaptic://",
    success: "successhaptic://",
    warning: "warninghaptic://",
    error: "errorhaptic://",
  };
  try {
    despia(schemes[type]);
  } catch {
    // Haptics are a progressive enhancement; never crash the app.
  }
}

export function syncStatusBarWithTheme(theme: "light" | "dark") {
  if (!isDespia()) return;
  const color = theme === "dark" ? "white" : "black";
  try {
    despia(`statusbartextcolor://${color}`);
  } catch {
    // Ignore failures; the editor default will still apply.
  }
}

declare global {
  interface Window {
    onBioAuthSuccess?: () => void;
    onBioAuthFailure?: (code: string, message: string) => void;
    onBioAuthUnavailable?: () => void;
  }
}

let bioResolve: ((result: { success: boolean; error?: string }) => void) | null = null;

export function registerBiometricCallbacks() {
  if (typeof window === "undefined") return;

  window.onBioAuthSuccess = () => {
    bioResolve?.({ success: true });
    bioResolve = null;
  };

  window.onBioAuthFailure = (_code: string, message: string) => {
    bioResolve?.({ success: false, error: message });
    bioResolve = null;
  };

  window.onBioAuthUnavailable = () => {
    bioResolve?.({ success: false, error: "Biometric authentication is unavailable on this device" });
    bioResolve = null;
  };
}

export function requestBiometric(): Promise<{ success: boolean; error?: string }> {
  if (!isDespia()) {
    return Promise.resolve({
      success: false,
      error: "Biometric login is only available in the Despia native app",
    });
  }

  registerBiometricCallbacks();

  return new Promise((resolve) => {
    bioResolve = resolve;
    try {
      despia("bioauth://");
    } catch {
      resolve({ success: false, error: "Could not start biometric authentication" });
    }
  });
}

export interface LocationFix {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

export function getCurrentLocation(): Promise<LocationFix> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("Location services are not available"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

export function linkPushUserId(userId: string) {
  if (!isDespia()) return;
  try {
    despia(`setonesignalplayerid://?user_id=${encodeURIComponent(userId)}`);
  } catch {
    // Ignore; push linking is a best-effort enhancement.
  }
}

export async function checkPushPermission(): Promise<boolean | null> {
  if (!isDespia()) return null;
  try {
    const result = (await despia("checkNativePushPermissions://", ["nativePushEnabled"])) as {
      nativePushEnabled?: boolean;
    };
    return result?.nativePushEnabled ?? false;
  } catch {
    return false;
  }
}

/**
 * Ask the native shell to prompt the OS push permission dialog (iOS/Android 13+).
 * Safe to call multiple times; the OS only prompts once.
 */
export function requestPushPermission() {
  if (!isDespia()) return;
  try {
    despia("registerpush://");
  } catch {
    // Ignore.
  }
}

/**
 * Open the native camera. On Despia we invoke the native camera scheme.
 * On the web we fall back to a hidden <input type=file capture> so the flow
 * still works in the preview. Resolves once the user picks/cancels.
 */
export function openCamera(onCapture?: (file: File | null) => void): void {
  // Native camera on Despia
  if (isDespia()) {
    try {
      despia("camera://");
    } catch {
      // fall through to web fallback
    }
    // Despia camera returns via the app's own upload plumbing; we still fire
    // the callback so UI can advance optimistically.
    onCapture?.(null);
    return;
  }

  if (typeof document === "undefined") {
    onCapture?.(null);
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.setAttribute("capture", "environment");
  input.style.display = "none";
  input.onchange = () => {
    const file = input.files?.[0] ?? null;
    onCapture?.(file);
    input.remove();
  };
  document.body.appendChild(input);
  input.click();
}

export function openNativeSettings() {
  if (!isDespia()) return;
  try {
    despia("settingsapp://");
  } catch {
    // Fallback silently if the runtime doesn't support it.
  }
}

/**
 * Sets the app icon badge count (iOS + supported Android launchers).
 * Best-effort — silently no-ops if the native shell doesn't support it.
 */
export function setAppBadgeCount(count: number) {
  const safe = Math.max(0, Math.floor(count));
  // Web platform (PWA) badge API
  try {
    const nav = navigator as Navigator & {
      setAppBadge?: (n?: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    if (safe === 0 && nav.clearAppBadge) nav.clearAppBadge().catch(() => {});
    else nav.setAppBadge?.(safe).catch(() => {});
  } catch {
    // ignore
  }
  if (!isDespia()) return;
  try {
    despia(`applicationiconbadgenumber://?number=${safe}`);
  } catch {
    // ignore
  }
}


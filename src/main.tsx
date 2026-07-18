import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  isDespia,
  registerBiometricCallbacks,
  syncStatusBarWithTheme,
  requestPushPermission,
  linkPushUserId,
} from "./lib/despia.ts";

// Initialize native runtime helpers on app launch.
if (isDespia()) {
  registerBiometricCallbacks();
  const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  syncStatusBarWithTheme(currentTheme);

  // Prompt push permission once, then link the OneSignal player id to a stable
  // local user id so notifications can be targeted per account.
  try {
    const PUSH_KEY = "kejasure_push_prompted";
    const USER_ID_KEY = "kejasure_local_user_id";
    if (!localStorage.getItem(PUSH_KEY)) {
      requestPushPermission();
      localStorage.setItem(PUSH_KEY, "true");
    }
    let uid = localStorage.getItem(USER_ID_KEY);
    if (!uid) {
      uid = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(USER_ID_KEY, uid);
    }
    linkPushUserId(uid);
  } catch {
    // best effort
  }
}

createRoot(document.getElementById("root")!).render(<App />);

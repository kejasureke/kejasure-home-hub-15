import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isDespia, registerBiometricCallbacks, syncStatusBarWithTheme } from "./lib/despia.ts";

// Initialize native runtime helpers on app launch.
if (isDespia()) {
  registerBiometricCallbacks();
  const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  syncStatusBarWithTheme(currentTheme);
}

createRoot(document.getElementById("root")!).render(<App />);

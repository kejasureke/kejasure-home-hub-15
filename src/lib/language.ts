import { useSyncExternalStore } from "react";
import kiswahili from "./kiswahili.json";

export type AppLanguage = "en" | "sw";
const LANGUAGE_KEY = "kejasure_language";
const listeners = new Set<() => void>();

export function readLanguage(): AppLanguage {
  try { return localStorage.getItem(LANGUAGE_KEY) === "sw" ? "sw" : "en"; }
  catch { return "en"; }
}

let currentLanguage = readLanguage();

export function setAppLanguage(language: AppLanguage) {
  currentLanguage = language;
  try { localStorage.setItem(LANGUAGE_KEY, language); } catch { /* Keep this session usable. */ }
  document.documentElement.lang = language;
  listeners.forEach((listener) => listener());
}

export function translate(text: string, language: AppLanguage = currentLanguage): string {
  if (language === "en") return text;
  return (kiswahili as Record<string, string>)[text] ?? text;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function useLanguage() {
  const language = useSyncExternalStore(subscribe, () => currentLanguage, () => "en" as AppLanguage);
  return { language, setLanguage: setAppLanguage, t: translate };
}

if (typeof window !== "undefined") {
  document.documentElement.lang = currentLanguage;
  window.addEventListener("storage", (event) => {
    if (event.key !== LANGUAGE_KEY) return;
    currentLanguage = readLanguage();
    document.documentElement.lang = currentLanguage;
    listeners.forEach((listener) => listener());
  });
}
import { useSyncExternalStore } from "react";
import type { Property } from "@/data/mockData";

export interface HomeDetails {
  availability?: "available" | "viewing" | "taken";
  confirmedAt?: string;
  deposit?: number;
  agencyFee?: number;
  agreementFee?: number;
  otherUpfront?: number;
  waterMonthly?: number;
  serviceMonthly?: number;
  parkingMonthly?: number;
  pets?: "yes" | "no" | "ask";
  accessible?: "yes" | "no" | "ask";
  maxOccupants?: number;
  moveInDate?: string;
  stage?: string;
  route?: string;
  destination?: string;
  walkMinutes?: number;
  rideMinutes?: number;
  fare?: number;
}
export interface ViewingNote {
  id: string;
  title: string;
  estate: string;
  price: number;
  date: string;
  checks: Record<string, "good" | "concern" | "unchecked">;
  notes: string;
  photos: string[];
  destination?: string;
  commute?: string;
}
const EVENT = "house-hunting-updated";
const DETAILS = "kejasure_home_details";
const NOTES = "kejasure_viewing_notes";
export const LOW_DATA_KEY = "kejasure_low_data";

function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
}
export function writeLocal(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(EVENT));
}
export function homeDetails(property: Property): HomeDetails {
  const saved = read<Record<string, HomeDetails>>(DETAILS, {})[property.id];
  return { deposit: property.deposit, pets: property.petFriendly === undefined ? "ask" : property.petFriendly ? "yes" : "no", ...property.homeDetails, ...saved };
}
export function localHomes(): Property[] { return read("kejasure_local_homes", []); }
export function saveLocalHome(property: Property) { writeLocal("kejasure_local_homes", [property, ...localHomes().filter(p => p.id !== property.id)]); }
export function saveHomeDetails(id: string, details: HomeDetails) {
  writeLocal(DETAILS, { ...read<Record<string, HomeDetails>>(DETAILS, {}), [id]: details });
}
export function viewingNotes(): ViewingNote[] { return read(NOTES, []); }
export function saveViewingNote(note: ViewingNote) {
  writeLocal(NOTES, [note, ...viewingNotes().filter(n => n.id !== note.id)]);
}
export function deleteViewingNote(id: string) { writeLocal(NOTES, viewingNotes().filter(n => n.id !== id)); }
export function useHouseHunting() {
  return useSyncExternalStore(subscribe, () => version, () => 0);
}
let version = 0;
function subscribe(listener: () => void) {
  const update = () => { version += 1; listener(); };
  window.addEventListener(EVENT, update);
  window.addEventListener("storage", update);
  return () => { window.removeEventListener(EVENT, update); window.removeEventListener("storage", update); };
}
export function useLowData() {
  useHouseHunting();
  const enabled = read(LOW_DATA_KEY, false);
  return { enabled, setEnabled: (value: boolean) => writeLocal(LOW_DATA_KEY, value) };
}
export function costSummary(property: Property, details = homeDetails(property)) {
  const upfront = [details.deposit, details.agencyFee, details.agreementFee, details.otherUpfront];
  const recurring = [details.waterMonthly, details.serviceMonthly, details.parkingMonthly];
  return {
    upfront: property.price + upfront.reduce<number>((sum, n) => sum + (n ?? 0), 0),
    monthly: property.price + recurring.reduce<number>((sum, n) => sum + (n ?? 0), 0),
    complete: [...upfront, ...recurring].every(n => n !== undefined),
  };
}
export function freshAvailability(details: HomeDetails) {
  if (details.availability !== "available" || !details.confirmedAt) return false;
  const age = Date.now() - Date.parse(details.confirmedAt);
  return Number.isFinite(age) && age >= 0 && age <= 7 * 86400000;
}
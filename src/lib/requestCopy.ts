import type { Property, ServiceProvider } from "@/data/mockData";
import { OTHER_SERVICES } from "@/data/serviceCategories";
import { translate } from "@/lib/language";

/**
 * Wording for request buttons and locked-contact messages, tailored to what the
 * provider offers. Tenants never pay: contacts and chat unlock only when the
 * provider accepts the request.
 */
export interface RequestCopy {
  /** Button label, e.g. "Request delivery" */
  cta: string;
  /** What the tenant sends, e.g. "delivery request" */
  noun: string;
  /** Who accepts, e.g. "the host" or a provider's name */
  who: string;
}

const DELIVERIES = ["Gas Delivery", "Water Delivery", "Food Delivery", "Grocery Delivery"];

export function serviceRequestCopy(p: Pick<ServiceProvider, "category" | "subServices" | "name">): RequestCopy {
  const who = p.name;
  if (p.category === OTHER_SERVICES) {
    const subs = p.subServices ?? [];
    if (subs.length && subs.every((s) => DELIVERIES.includes(s))) return { cta: "Request delivery", noun: "delivery request", who };
    if (subs.length === 1 && subs[0] === "Garbage Collection") return { cta: "Request pick-up", noun: "pick-up request", who };
    if (subs.length === 1 && subs[0] === "Parcels & Errands") return { cta: "Request errand", noun: "errand request", who };
    return { cta: "Request service", noun: "service request", who };
  }
  if (p.category === "Movers") return { cta: "Request a move", noun: "move request", who };
  if (p.category === "Cleaners" || p.category === "Cleaning") return { cta: "Book cleaning", noun: "cleaning request", who };
  return { cta: "Request service", noun: "service request", who };
}

export function propertyRequestCopy(p: Pick<Property, "type" | "corporate">): RequestCopy {
  if (p.type === "shortstay") return { cta: "Book Stay", noun: "stay booking", who: "the host" };
  if (p.corporate) return { cta: "Request Viewing", noun: "viewing request", who: "the host" };
  if (p.type === "commercial") return { cta: "Request Viewing", noun: "viewing request", who: "the owner" };
  return { cta: "Request Viewing", noun: "viewing request", who: "the landlord" };
}

/** "Phone and chat unlock once {who} accepts your {noun}." — translated. */
export function unlockLine(copy: RequestCopy): string {
  return translate("Phone and chat unlock once {who} accepts your {noun}.")
    .replace("{who}", translate(copy.who))
    .replace("{noun}", translate(copy.noun));
}

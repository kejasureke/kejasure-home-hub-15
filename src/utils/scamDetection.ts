import type { Property } from "@/data/mockData";

export interface ScamRiskResult {
  score: number; // 0-100 (higher = riskier)
  level: "low" | "medium" | "high";
  flags: string[];
  label: string;
}

export function getScamRiskScore(property: Property): ScamRiskResult {
  const flags: string[] = [];
  let score = 0;

  // Not verified
  if (!property.verified) {
    score += 25;
    flags.push("Listing not verified by KejaSure");
  }

  // Suspiciously low price
  const avgPriceByBedroom: Record<number, number> = { 1: 25000, 2: 45000, 3: 70000 };
  const expectedPrice = avgPriceByBedroom[property.bedrooms] || 50000;
  if (property.type === "rental" && property.price < expectedPrice * 0.4) {
    score += 30;
    flags.push("Price significantly below market average");
  }

  // Slow response
  if (property.landlordResponseSpeed === "slow") {
    score += 10;
    flags.push("Landlord has slow response times");
  }

  // No rating or very few reviews
  if (!property.rating || property.rating < 3) {
    score += 10;
    flags.push("No ratings or poor rating history");
  }
  if (property.reviewCount !== undefined && property.reviewCount < 3) {
    score += 5;
    flags.push("Very few reviews");
  }

  // Few amenities listed (potential low-effort fake)
  if (property.amenities.length <= 2) {
    score += 10;
    flags.push("Very few amenities listed");
  }

  // No images beyond the main one
  if (property.images.length <= 1) {
    score += 15;
    flags.push("Only one photo provided");
  }

  // Old activity
  if (property.lastActive.includes("hour") || property.lastActive.includes("day")) {
    const match = property.lastActive.match(/(\d+)/);
    if (match && parseInt(match[1]) > 24) {
      score += 5;
      flags.push("Landlord inactive for extended period");
    }
  }

  // Behaviour signals — how the listing was written and posted
  const text = `${property.title} ${property.description ?? ""}`;

  if (/\b(whats\s?app|telegram|call me on|inbox me|dm me)\b/i.test(text)) {
    score += 20;
    flags.push("Pushes you to chat outside KejaSure");
  }
  if (/\b(pay(ment)?\s*(the\s*)?(deposit|booking fee|reservation fee)|(deposit|booking fee|reservation fee)\s*(first|kwanza|before|to\s*(confirm|secure|book|reserve))|paybill\s*\d|till\s*(no\.?|number)?\s*\d|send\s*(the\s*)?(cash|money|ksh|kes|\d{3,})|lipa\s*na\s*m-?pesa)\b/i.test(text)) {
    score += 25;
    flags.push("Asks for money before a viewing");
  }
  if (/(\+?254|\b0)\s?7\d{2}\s?\d{3}\s?\d{3}\b/.test(text)) {
    score += 10;
    flags.push("Phone number hidden inside the listing text");
  }
  if (/[A-Z]{12,}|!{3,}/.test(text)) {
    score += 5;
    flags.push("Spam-style wording");
  }


  // Cap at 100
  score = Math.min(score, 100);

  let level: ScamRiskResult["level"];
  let label: string;

  if (score >= 50) {
    level = "high";
    label = "High Risk";
  } else if (score >= 25) {
    level = "medium";
    label = "Moderate Risk";
  } else {
    level = "low";
    label = "Low Risk";
  }

  return { score, level, flags, label };
}

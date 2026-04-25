import { describe, it, expect } from "vitest";
import { validateCaption } from "./captionSafety";

const isBlocked = (text: string) => validateCaption(text) !== null;
const reason = (text: string) => validateCaption(text);

describe("validateCaption", () => {
  describe("empty / length", () => {
    it("allows empty strings", () => {
      expect(validateCaption("")).toBeNull();
      expect(validateCaption("   ")).toBeNull();
    });

    it("blocks captions over 120 characters", () => {
      expect(validateCaption("a".repeat(121))).toMatch(/120 characters/);
    });

    it("allows captions exactly at 120 characters", () => {
      expect(validateCaption("a".repeat(120))).toBeNull();
    });
  });

  describe("phone numbers", () => {
    it.each([
      "Call +254712345678",
      "Reach me on 0712345678",
      "WhatsApp 0101234567",
      "Phone: 0712 345 678",
      "Number 254-712-345-678",
    ])("blocks phone number: %s", (text) => {
      expect(reason(text)).toMatch(/phone/i);
    });

    it("allows short digit runs (room counts, sleeps, etc.)", () => {
      expect(isBlocked("Sleeps 6 guests")).toBe(false);
      expect(isBlocked("Floor 5")).toBe(false);
      expect(isBlocked("3 bedrooms, 2 bathrooms")).toBe(false);
    });
  });

  describe("emails", () => {
    it("blocks email addresses", () => {
      expect(reason("Email me at host@example.com")).toMatch(/email/i);
      expect(reason("contact.me+listings@my-site.co.ke")).toMatch(/email/i);
    });
  });

  describe("Kenyan pricing — currency prefixes", () => {
    it.each([
      "Ksh 5M",
      "KSh 10,000",
      "KES 25000",
      "Sh 5,000",
      "USD 200",
      "EUR 150",
      "GBP 120",
      "$50",
      "€100",
      "£75",
    ])("blocks currency price: %s", (text) => {
      expect(reason(text)).toMatch(/pricing/i);
    });
  });

  describe("Kenyan pricing — k/M shorthand with context", () => {
    it.each([
      "10k/month",
      "12k / month",
      "15k per month",
      "8k pm",
      "6k p/m",
      "5k pn",
      "1.5m per night",
      "5M pn",
      "2.5k per week",
      "@15k only",
      "8k nego",
      "20k negotiable",
      "10k net",
      "Ksh 12k",
      "kes 5m",
    ])("blocks shorthand price: %s", (text) => {
      expect(reason(text)).toMatch(/pricing/i);
    });
  });

  describe("Kenyan pricing — explicit context with digits", () => {
    it.each([
      "10,000/-",
      "5,000/=",
      "20000 per month",
      "5000 bob",
      "15,000 shillings",
      "8000 shilling",
      "12000 per night",
      "3000 per day",
      "25000 per week",
    ])("blocks contextual price: %s", (text) => {
      expect(reason(text)).toMatch(/pricing/i);
    });
  });

  describe("legitimate Kenyan caption phrases", () => {
    it.each([
      "Room for 2 people",
      "Sleeps 6 guests",
      "3 bedrooms, 2 bathrooms",
      "Spacious 4BR with parking",
      "Cosy living area",
      "Modern kitchen with gas cooker",
      "Master ensuite on the 1st floor",
      "Floor 5, lift access",
      "10 minutes to CBD",
      "Walking distance to Sarit",
      "Borehole water 24/7",
      "DSQ available",
      "Wi-Fi up to 100mbps",
      "Backup generator",
      "Restful and freshly made bed",
      "Bright and airy lounge",
      "Cover · Restful and freshly made bed",
      "Open-plan kitchen and dining",
    ])("allows: %s", (text) => {
      expect(validateCaption(text)).toBeNull();
    });
  });

  describe("regression cases", () => {
    it("does not flag bare 'k' counts without price context", () => {
      // While imperfect, these should not be flagged as pricing.
      expect(isBlocked("10k followers welcome")).toBe(false);
    });

    it("does not flag standalone numbers like guest counts", () => {
      expect(isBlocked("Hosts up to 4 guests comfortably")).toBe(false);
    });

    it("does not flag floor or room numbers", () => {
      expect(isBlocked("Apartment 12 on floor 3")).toBe(false);
    });

    it("does flag the trailing /= shilling marker (Kenyan informal)", () => {
      expect(isBlocked("Going for 5,000/=")).toBe(true);
    });

    it("does flag the trailing /- shilling marker", () => {
      expect(isBlocked("Asking 10,000/-")).toBe(true);
    });
  });
});

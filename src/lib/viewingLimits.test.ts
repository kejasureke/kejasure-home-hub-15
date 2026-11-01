import { describe, expect, it } from "vitest";
import { canRequestViewing, pendingViewingCount } from "./viewingLimits";

describe("pending viewing limit", () => {
  it("allows up to three pending viewing requests, not a fourth", () => {
    const pending = { kind: "viewing", status: "pending" };
    expect(canRequestViewing([pending, pending])).toBe(true);
    expect(canRequestViewing([pending, pending, pending])).toBe(false);
    expect(canRequestViewing(Array(5).fill(pending))).toBe(false);
  });
  it("frees a slot when a request is accepted, declined or cancelled", () => {
    for (const status of ["accepted", "declined", "cancelled"]) {
      const bookings = [
        { kind: "viewing", status: "pending" },
        { kind: "viewing", status: "pending" },
        { kind: "viewing", status },
      ];
      expect(pendingViewingCount(bookings)).toBe(2);
      expect(canRequestViewing(bookings)).toBe(true);
    }
  });
  it("does not count stays as pending viewings", () => {
    expect(pendingViewingCount([{ kind: "shortstay", status: "pending" }])).toBe(0);
  });
});
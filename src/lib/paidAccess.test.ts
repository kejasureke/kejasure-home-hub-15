import { describe, expect, it } from "vitest";
import { canRevealContact, isActiveSubscription } from "./paidAccess";

describe("tenant contact access", () => {
  it("never reveals contacts to an unpaid tenant even after acceptance", () => {
    expect(canRevealContact(false, "accepted")).toBe(false);
    expect(canRevealContact(false, "completed")).toBe(false);
  });
  it("requires acceptance as well as payment", () => {
    expect(canRevealContact(true, "pending")).toBe(false);
    expect(canRevealContact(true, "accepted")).toBe(true);
  });
  it("revokes access exactly when the subscription expires", () => {
    const sub = { status: "active", starts_at: "2026-10-31T12:00:00Z", ends_at: "2026-11-01T12:00:00Z" };
    expect(isActiveSubscription(sub, Date.parse("2026-11-01T11:59:59Z"))).toBe(true);
    expect(isActiveSubscription(sub, Date.parse(sub.ends_at))).toBe(false);
    expect(isActiveSubscription({ ...sub, status: "pending" }, Date.parse(sub.starts_at))).toBe(false);
    expect(isActiveSubscription({ ...sub, ends_at: null })).toBe(false);
  });
});
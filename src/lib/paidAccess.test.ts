import { describe, expect, it } from "vitest";
import { canRevealContact, isActiveSubscription } from "./paidAccess";

describe("tenant contact access", () => {
  it("tenants are free: contacts reveal once the booking is accepted", () => {
    expect(canRevealContact("accepted")).toBe(true);
    expect(canRevealContact("completed")).toBe(true);
  });
  it("contacts stay hidden until the booking is accepted", () => {
    expect(canRevealContact("requested")).toBe(false);
    expect(canRevealContact("declined")).toBe(false);
    expect(canRevealContact(undefined)).toBe(false);
  });
  it("provider subscriptions expire exactly at ends_at", () => {
    const sub = { status: "active", starts_at: "2026-10-31T12:00:00Z", ends_at: "2026-11-01T12:00:00Z" };
    expect(isActiveSubscription(sub, Date.parse("2026-11-01T11:59:59Z"))).toBe(true);
    expect(isActiveSubscription(sub, Date.parse(sub.ends_at))).toBe(false);
  });
});

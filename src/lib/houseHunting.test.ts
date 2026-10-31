import { describe, it, expect } from "vitest";
import { costSummary } from "./houseHunting";
import type { Property } from "@/data/mockData";

describe("disclosed move-in costs", () => {
  const home = { price: 20000 } as Property;
  it("adds only stated costs to rent and keeps unknown fees incomplete", () => {
    const result = costSummary(home, { deposit: 20000, agencyFee: 1500 });
    expect(result.upfront).toBe(41500);
    expect(result.complete).toBe(false);
  });
  it("accepts explicit zero charges instead of treating them as unknown", () => {
    expect(costSummary(home, { deposit: 0, agencyFee: 0, agreementFee: 0, otherUpfront: 0, waterMonthly: 0, serviceMonthly: 0, parkingMonthly: 0 })).toEqual({ upfront: 20000, monthly: 20000, complete: true });
  });
});
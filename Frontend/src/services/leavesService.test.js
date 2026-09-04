import { describe, it, expect } from "vitest";
import { isOnLeave } from "./leavesService";

const leaves = [
  { doctorId: "d1", from: "2025-12-10", to: "2025-12-15" },
  { doctorId: "d2", from: "2025-12-01", to: "2025-12-01" },
];

describe("isOnLeave", () => {
  it("is true for a date inside the leave range (inclusive of both ends)", () => {
    expect(isOnLeave(leaves, "d1", "2025-12-10")).toBe(true);
    expect(isOnLeave(leaves, "d1", "2025-12-12")).toBe(true);
    expect(isOnLeave(leaves, "d1", "2025-12-15")).toBe(true);
  });

  it("is false for a date just outside the range", () => {
    expect(isOnLeave(leaves, "d1", "2025-12-09")).toBe(false);
    expect(isOnLeave(leaves, "d1", "2025-12-16")).toBe(false);
  });

  it("is false for a different doctor even on the same date", () => {
    expect(isOnLeave(leaves, "d2", "2025-12-12")).toBe(false);
  });

  it("handles a single-day leave", () => {
    expect(isOnLeave(leaves, "d2", "2025-12-01")).toBe(true);
  });

  it("is false when there are no leaves at all", () => {
    expect(isOnLeave([], "d1", "2025-12-10")).toBe(false);
    expect(isOnLeave(undefined, "d1", "2025-12-10")).toBe(false);
  });
});

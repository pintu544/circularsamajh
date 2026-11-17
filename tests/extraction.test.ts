import { describe, expect, it } from "vitest";
import { ExtractionSchema } from "@/lib/extraction";

describe("ExtractionSchema", () => {
  const valid = {
    title: "Term 2 Fee Payment",
    summaryEn: "Please pay the Term 2 fee of ₹8,450 by 14 November 2026.",
    summaryHi: "कृपया 14 नवंबर 2026 तक टर्म 2 की फीस ₹8,450 जमा करें।",
    actions: [
      {
        action: "Pay the Term 2 fee",
        dueDate: "2026-11-14",
        amount: "₹8,450",
        document: null,
      },
      { action: "Attend the meeting", dueDate: null, amount: null, document: "School diary" },
    ],
  };

  it("accepts a well-formed extraction", () => {
    const parsed = ExtractionSchema.parse(valid);
    expect(parsed.actions).toHaveLength(2);
    expect(parsed.actions[0].amount).toBe("₹8,450");
  });

  it("coerces empty strings to null for absent fields", () => {
    const parsed = ExtractionSchema.parse({
      ...valid,
      actions: [{ action: "Read the notice", dueDate: "", amount: "", document: "" }],
    });
    expect(parsed.actions[0]).toEqual({
      action: "Read the notice",
      dueDate: null,
      amount: null,
      document: null,
    });
  });

  it("rejects a non-ISO due date", () => {
    expect(() =>
      ExtractionSchema.parse({
        ...valid,
        actions: [{ action: "Pay", dueDate: "14/11/2026", amount: null, document: null }],
      }),
    ).toThrow();
  });

  it("rejects a missing summary", () => {
    const { summaryHi: _dropped, ...rest } = valid;
    expect(() => ExtractionSchema.parse(rest)).toThrow();
  });

  it("accepts an empty actions list", () => {
    const parsed = ExtractionSchema.parse({ ...valid, actions: [] });
    expect(parsed.actions).toEqual([]);
  });
});

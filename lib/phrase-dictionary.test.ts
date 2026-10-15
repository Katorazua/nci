import { describe, expect, it } from "vitest";
import { courtPhrases, findCourtPhrase, normalizePhrase } from "./phrase-dictionary";

describe("local court phrase dictionary", () => {
  it("contains at least 40 uniquely identified phrase pairs", () => {
    expect(courtPhrases.length).toBeGreaterThanOrEqual(40);
    expect(new Set(courtPhrases.map((phrase) => phrase.id)).size).toBe(courtPhrases.length);
    expect(courtPhrases.every((phrase) => phrase.english && phrase.pidgin && phrase.category)).toBe(true);
  });

  it("finds an exact phrase after safe whitespace and case normalization", () => {
    expect(findCourtPhrase("  PLEASE   TAKE YOUR SEAT. ")?.pidgin).toBe("Abeg, make you sit down.");
    expect(normalizePhrase(" A   B ")).toBe("a b");
  });

  it("does not match arbitrary or partial sentences", () => {
    expect(findCourtPhrase("Please take your seat and wait.")).toBeUndefined();
    expect(findCourtPhrase("Please take your")).toBeUndefined();
  });

  it("preserves the supplied date, time, and negation in relevant entries", () => {
    expect(findCourtPhrase("Please return to court on Monday at 9:00 AM.")?.pidgin).toContain("Monday by 9:00 AM");
    expect(findCourtPhrase("The hearing will start by 9 o'clock.")?.pidgin).toBe("The hearing go start by 9 o'clock.");
    expect(findCourtPhrase("Do not interrupt the speaker.")?.pidgin.toLowerCase()).toContain("no interrupt");
  });
});

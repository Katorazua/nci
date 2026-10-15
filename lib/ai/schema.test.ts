import { describe, expect, it } from "vitest";
import { translateRequestSchema, translationSchema } from "./schema";

describe("translation request validation", () => {
  it("rejects empty and oversized text", () => {
    expect(translateRequestSchema.safeParse({ text: " ", sourceLanguage: "en", targetLanguage: "pcm" }).success).toBe(false);
    expect(translateRequestSchema.safeParse({ text: "a".repeat(2001), sourceLanguage: "en", targetLanguage: "pcm" }).success).toBe(false);
  });
  it("rejects unknown identifiers and same-language pairs", () => {
    expect(translateRequestSchema.safeParse({ text: "Hello", sourceLanguage: "ig", targetLanguage: "pcm" }).success).toBe(false);
    expect(translateRequestSchema.safeParse({ text: "Hello", sourceLanguage: "en", targetLanguage: "en" }).success).toBe(false);
  });
  it("accepts both supported directions", () => {
    expect(translateRequestSchema.safeParse({ text: "Please wait.", sourceLanguage: "en", targetLanguage: "pcm" }).success).toBe(true);
    expect(translateRequestSchema.safeParse({ text: "Abeg wait.", sourceLanguage: "pcm", targetLanguage: "en" }).success).toBe(true);
  });
});

describe("provider response validation", () => {
  it("accepts structured output with review warnings", () => {
    expect(translationSchema.safeParse({ translation: "Abeg wait.", sourceLanguage: "en", targetLanguage: "pcm", warnings: ["Verify the intended date."], requiresHumanReview: true }).success).toBe(true);
  });
  it("rejects malformed output", () => {
    expect(translationSchema.safeParse({ translation: "", sourceLanguage: "en", targetLanguage: "pcm", warnings: [], requiresHumanReview: true }).success).toBe(false);
  });
});

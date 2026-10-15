import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/config", () => {
  it("reports presence only and never returns API key values", async () => {
    const before = { openai: process.env.OPENAI_API_KEY, anthropic: process.env.ANTHROPIC_API_KEY, provider: process.env.AI_PROVIDER };
    process.env.OPENAI_API_KEY = "openai-secret-sentinel";
    process.env.ANTHROPIC_API_KEY = "anthropic-secret-sentinel";
    process.env.AI_PROVIDER = "anthropic";
    try {
      const response = GET();
      const text = await response.text();
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(text).toBe(JSON.stringify({
        activeProvider: "openai",
        activeConfigured: true,
        providers: { openai: { configured: true }, anthropic: { configured: true } },
      }));
      expect(text).not.toContain("secret-sentinel");
    } finally {
      if (before.openai === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = before.openai;
      if (before.anthropic === undefined) delete process.env.ANTHROPIC_API_KEY; else process.env.ANTHROPIC_API_KEY = before.anthropic;
      if (before.provider === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = before.provider;
    }
  });
});

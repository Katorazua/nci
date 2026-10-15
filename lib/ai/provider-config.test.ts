import { describe, expect, it } from "vitest";
import { getProviderConfiguration } from "./provider-config";

describe("provider configuration check", () => {
  it("reports key presence and selects OpenAI without returning key values", () => {
    const status = getProviderConfiguration({
      AI_PROVIDER: "anthropic",
      OPENAI_API_KEY: "openai-secret-value",
      ANTHROPIC_API_KEY: "anthropic-secret-value",
    });
    expect(status).toEqual({
      activeProvider: "openai",
      activeConfigured: true,
      providers: { openai: { configured: true }, anthropic: { configured: true } },
    });
    expect(JSON.stringify(status)).not.toContain("secret-value");
  });

  it("requires an OpenAI key even when a Claude key is present", () => {
    const status = getProviderConfiguration({ AI_PROVIDER: "anthropic", OPENAI_API_KEY: "  ", ANTHROPIC_API_KEY: "anthropic-present" });
    expect(status.activeProvider).toBe("openai");
    expect(status.activeConfigured).toBe(false);
    expect(status.providers.anthropic.configured).toBe(true);
  });

  it("defaults to OpenAI and rejects an unsupported provider name", () => {
    expect(getProviderConfiguration({ OPENAI_API_KEY: "set" }).activeProvider).toBe("openai");
    expect(getProviderConfiguration({ AI_PROVIDER: "anthropic" }).activeProvider).toBe("openai");
  });
});

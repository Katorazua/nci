import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdkMocks = vi.hoisted(() => ({ openaiTranslate: vi.fn(), anthropicTranslate: vi.fn() }));

vi.mock("./openai-provider", () => ({
  OpenAIProvider: class { translate(...args: unknown[]) { return sdkMocks.openaiTranslate(...args); } },
}));
vi.mock("./anthropic-provider", () => ({
  AnthropicProvider: class { translate(...args: unknown[]) { return sdkMocks.anthropicTranslate(...args); } },
}));

import { ProviderError, translateWithProvider } from "./provider";

const sampleRequest = { text: "Please wait.", sourceLanguage: "en" as const, targetLanguage: "pcm" as const };
const sampleResponse = { translation: "Abeg wait.", sourceLanguage: "en", targetLanguage: "pcm", warnings: [], requiresHumanReview: true };

describe("provider selection", () => {
  const original = { AI_PROVIDER: process.env.AI_PROVIDER, OPENAI_API_KEY: process.env.OPENAI_API_KEY, ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY };

  beforeEach(() => {
    sdkMocks.openaiTranslate.mockReset();
    sdkMocks.anthropicTranslate.mockReset();
    delete process.env.AI_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it("requires the OpenAI key and never invokes Claude", async () => {
    process.env.AI_PROVIDER = "anthropic";
    process.env.OPENAI_API_KEY = "";
    await expect(translateWithProvider(sampleRequest)).rejects.toMatchObject({ kind: "unconfigured" });
    expect(sdkMocks.openaiTranslate).not.toHaveBeenCalled();
    expect(sdkMocks.anthropicTranslate).not.toHaveBeenCalled();
  });

  it("uses OpenAI only and validates its response", async () => {
    process.env.AI_PROVIDER = "anthropic";
    process.env.OPENAI_API_KEY = "test-key";
    sdkMocks.openaiTranslate.mockResolvedValue(sampleResponse);
    await expect(translateWithProvider(sampleRequest)).resolves.toEqual(sampleResponse);
    expect(sdkMocks.openaiTranslate).toHaveBeenCalledOnce();
    expect(sdkMocks.anthropicTranslate).not.toHaveBeenCalled();
  });

  it("rejects malformed SDK output after it has been returned", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    sdkMocks.openaiTranslate.mockResolvedValue({ translation: "", sourceLanguage: "en", targetLanguage: "pcm", warnings: [], requiresHumanReview: true });
    await expect(translateWithProvider(sampleRequest)).rejects.toBeInstanceOf(Error);
  });

  it("uses the typed setup error", () => {
    expect(new ProviderError("unconfigured").kind).toBe("unconfigured");
  });
});

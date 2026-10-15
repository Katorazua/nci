import { afterEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({ create: vi.fn(), options: vi.fn() }));
vi.mock("openai", () => ({
  default: class OpenAI {
    responses = { create: sdk.create };
    constructor(options: unknown) { sdk.options(options); }
  },
}));
vi.mock("openai/helpers/zod", () => ({ zodTextFormat: vi.fn(() => ({ type: "json_schema", name: "court_translation" })) }));

import { OpenAIProvider } from "./openai-provider";

describe("OpenAIProvider", () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODEL;

  afterEach(() => {
    sdk.create.mockReset();
    sdk.options.mockReset();
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.OPENAI_MODEL; else process.env.OPENAI_MODEL = originalModel;
  });

  it("extracts and parses the actual SDK message content", async () => {
    process.env.OPENAI_API_KEY = "test-only-key";
    process.env.OPENAI_MODEL = "test-model";
    sdk.create.mockResolvedValue({ output_text: JSON.stringify({
      translation: "Abeg take your seat.", sourceLanguage: "en", targetLanguage: "pcm", warnings: [], requiresHumanReview: true,
    }) });

    const result = await new OpenAIProvider().translate({ text: "Please take your seat.", sourceLanguage: "en", targetLanguage: "pcm" });

    expect(result).toMatchObject({ translation: "Abeg take your seat.", sourceLanguage: "en", targetLanguage: "pcm" });
    expect(sdk.create).toHaveBeenCalledWith(expect.objectContaining({ model: "test-model", text: { format: { type: "json_schema", name: "court_translation" } } }));
    expect(sdk.create.mock.calls[0]?.[0]).toHaveProperty("input");
    expect(sdk.options).toHaveBeenCalledWith(expect.objectContaining({ apiKey: "test-only-key", timeout: 20000 }));
  });

  it("rejects empty content instead of returning a placeholder", async () => {
    process.env.OPENAI_API_KEY = "test-only-key";
    sdk.create.mockResolvedValue({ output_text: "" });
    await expect(new OpenAIProvider().translate({ text: "Please wait.", sourceLanguage: "en", targetLanguage: "pcm" })).rejects.toThrow("empty provider response");
  });

  it("rejects malformed response text for server validation", async () => {
    process.env.OPENAI_API_KEY = "test-only-key";
    sdk.create.mockResolvedValue({ output_text: "not-json" });
    await expect(new OpenAIProvider().translate({ text: "Please wait.", sourceLanguage: "en", targetLanguage: "pcm" })).rejects.toBeInstanceOf(SyntaxError);
  });
});

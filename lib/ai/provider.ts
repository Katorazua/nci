import "server-only";
import type { Translation } from "./schema";
import { classifyProviderError } from "./provider-errors";
export { safeProviderMessage } from "./provider-errors";

export type TranslationInput = { text: string; sourceLanguage: "en" | "pcm"; targetLanguage: "en" | "pcm" };
export interface TranslationProvider { translate(input: TranslationInput): Promise<unknown> }

export class ProviderError extends Error {
  constructor(public readonly kind: "unconfigured" | "auth" | "rate_limit" | "timeout" | "network" | "provider") {
    super(kind);
  }
}

export async function translateWithProvider(input: TranslationInput): Promise<Translation> {
  const provider = process.env.AI_PROVIDER ?? "openai";
  let raw: unknown;
  try {
    if (provider === "openai") {
      if (!process.env.OPENAI_API_KEY) throw new ProviderError("unconfigured");
      const { OpenAIProvider } = await import("./openai-provider");
      raw = await new OpenAIProvider().translate(input);
    } else if (provider === "anthropic") {
      if (!process.env.ANTHROPIC_API_KEY) throw new ProviderError("unconfigured");
      const { AnthropicProvider } = await import("./anthropic-provider");
      raw = await new AnthropicProvider().translate(input);
    } else {
      throw new ProviderError("unconfigured");
    }
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new ProviderError(classifyProviderError(error));
  }
  return (await import("./schema")).translationSchema.parse(raw);
}

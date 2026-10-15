import "server-only";
import type { Translation } from "./schema";
import { classifyProviderError } from "./provider-errors";
import { getProviderConfiguration } from "./provider-config";
export { safeProviderMessage } from "./provider-errors";

export type TranslationInput = { text: string; sourceLanguage: "en" | "pcm"; targetLanguage: "en" | "pcm" };
export interface TranslationProvider { translate(input: TranslationInput): Promise<unknown> }

export class ProviderError extends Error {
  constructor(public readonly kind: "unconfigured" | "auth" | "quota" | "rate_limit" | "timeout" | "network" | "model" | "request" | "provider") {
    super(kind);
  }
}

export async function translateWithProvider(input: TranslationInput): Promise<Translation> {
  const configuration = getProviderConfiguration();
  if (!configuration.providers.openai.configured) throw new ProviderError("unconfigured");
  let raw: unknown;
  try {
    const { OpenAIProvider } = await import("./openai-provider");
    raw = await new OpenAIProvider().translate(input);
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    throw new ProviderError(classifyProviderError(error));
  }
  return (await import("./schema")).translationSchema.parse(raw);
}

import "server-only";

export type ProviderName = "openai" | "anthropic";
export type ProviderEnvironment = {
  AI_PROVIDER?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
};

export type ProviderConfiguration = {
  activeProvider: ProviderName | null;
  activeConfigured: boolean;
  providers: Record<ProviderName, { configured: boolean }>;
};

export function getProviderConfiguration(env: ProviderEnvironment = {
  AI_PROVIDER: process.env.AI_PROVIDER,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
}): ProviderConfiguration {
  const providers = {
    openai: { configured: Boolean(env.OPENAI_API_KEY?.trim()) },
    anthropic: { configured: Boolean(env.ANTHROPIC_API_KEY?.trim()) },
  };
  // This build deliberately uses OpenAI only; ANTHROPIC_API_KEY is reported
  // for configuration visibility but never selected or contacted.
  const activeProvider: ProviderName = "openai";

  return {
    activeProvider,
    activeConfigured: providers.openai.configured,
    providers,
  };
}

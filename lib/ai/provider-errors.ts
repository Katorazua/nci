export type ProviderFailure = "unconfigured" | "auth" | "rate_limit" | "timeout" | "network" | "provider";

export function classifyProviderError(error: unknown): ProviderFailure {
  const candidate = error as { status?: number; name?: string; code?: string };
  if (candidate?.status === 401 || candidate?.status === 403) return "auth";
  if (candidate?.status === 429) return "rate_limit";
  if (candidate?.name === "AbortError" || candidate?.name === "APIConnectionTimeoutError") return "timeout";
  if (candidate?.name === "APIConnectionError" || candidate?.code === "ECONNRESET") return "network";
  return "provider";
}

export function safeProviderMessage(kind: ProviderFailure): string {
  switch (kind) {
    case "unconfigured": return "Translation is not configured. Add the selected provider API key to .env.local and restart the server.";
    case "auth": return "The translation provider rejected its API key. Check the server configuration.";
    case "rate_limit": return "The translation service is busy. Please wait a moment and try again.";
    case "timeout": return "The translation service took too long to respond. Please try again.";
    case "network": return "Could not reach the translation service. Check the server connection and try again.";
    default: return "Translation could not be completed. Please try again.";
  }
}

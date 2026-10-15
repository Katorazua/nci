export type ProviderFailure = "unconfigured" | "auth" | "quota" | "rate_limit" | "timeout" | "network" | "model" | "request" | "provider";

export function classifyProviderError(error: unknown): ProviderFailure {
  const candidate = error as { status?: number; name?: string; code?: string; constructor?: { name?: string } };
  const errorName = candidate?.name === "Error" ? candidate.constructor?.name : candidate?.name;
  if (candidate?.status === 401 || candidate?.status === 403) return "auth";
  if (candidate?.status === 429) {
    const apiError = error as { code?: string; error?: { code?: string; type?: string } };
    if ([apiError.code, apiError.error?.code, apiError.error?.type].some((value) => value === "insufficient_quota" || value === "billing_hard_limit_reached")) return "quota";
    return "rate_limit";
  }
  if (candidate?.status === 404) return "model";
  if (candidate?.status === 400) return "request";
  if (errorName === "AbortError" || errorName === "APIConnectionTimeoutError") return "timeout";
  if (errorName === "APIConnectionError" || ["ECONNRESET", "ENOTFOUND", "EAI_AGAIN", "ETIMEDOUT"].includes(candidate?.code ?? "")) return "network";
  return "provider";
}

export function safeProviderMessage(kind: ProviderFailure): string {
  switch (kind) {
    case "unconfigured": return "Translation is not configured. Add OPENAI_API_KEY to .env.local and restart the server.";
    case "auth": return "The translation provider rejected its API key. Check the server configuration.";
    case "quota": return "The OpenAI account has no available API quota. Check its billing and usage limits, then try again.";
    case "rate_limit": return "The translation service is busy. Please wait a moment and try again.";
    case "timeout": return "The translation service took too long to respond. Please try again.";
    case "network": return "Could not reach the translation service. Check the server connection and try again.";
    case "model": return "OpenAI could not find or access the configured model. Check OPENAI_MODEL and your model access.";
    case "request": return "OpenAI rejected the translation request. Check the configured model and try again.";
    default: return "Translation could not be completed. Please try again.";
  }
}

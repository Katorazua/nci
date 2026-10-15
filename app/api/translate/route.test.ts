import { beforeEach, describe, expect, it, vi } from "vitest";

const providerMock = vi.hoisted(() => {
  class ProviderError extends Error {
    constructor(public readonly kind: string) { super(kind); }
  }
  return { translateWithProvider: vi.fn(), ProviderError };
});

vi.mock("@/lib/ai/provider", () => ({
  ProviderError: providerMock.ProviderError,
  translateWithProvider: providerMock.translateWithProvider,
  safeProviderMessage: (kind: string) => kind === "auth"
    ? "The translation provider rejected its API key. Check the server configuration."
    : "Translation could not be completed. Please try again.",
}));

import { POST } from "./route";

const validBody = { text: "Please return Monday at 9:00 AM.", sourceLanguage: "en", targetLanguage: "pcm" };
const validResponse = { translation: "Abeg come back Monday by 9:00 AM.", sourceLanguage: "en", targetLanguage: "pcm", warnings: [], requiresHumanReview: true };

function request(body: unknown, ip = crypto.randomUUID()) {
  return new Request("http://localhost/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("POST /api/translate", () => {
  beforeEach(() => providerMock.translateWithProvider.mockReset());

  it("returns a successful mocked provider translation", async () => {
    providerMock.translateWithProvider.mockResolvedValue(validResponse);
    const response = await POST(request(validBody));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(validResponse);
    expect(providerMock.translateWithProvider).toHaveBeenCalledOnce();
  });

  it("rejects an invalid request without calling the provider", async () => {
    const response = await POST(request({ ...validBody, text: " " }));
    expect(response.status).toBe(400);
    expect(providerMock.translateWithProvider).not.toHaveBeenCalled();
  });

  it("returns a safe error for malformed provider output", async () => {
    providerMock.translateWithProvider.mockResolvedValue({ translation: "", sourceLanguage: "en", targetLanguage: "pcm", warnings: [], requiresHumanReview: true });
    const response = await POST(request(validBody));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "The translation service returned an unreadable response. Please retry." });
  });

});

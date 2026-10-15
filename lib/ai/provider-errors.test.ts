import { describe, expect, it } from "vitest";
import { classifyProviderError, safeProviderMessage } from "./provider-errors";

describe("provider failures", () => {
  it.each([
    [{ status: 401 }, "auth"], [{ status: 429 }, "rate_limit"],
    [{ name: "APIConnectionTimeoutError" }, "timeout"],
    [{ name: "APIConnectionError" }, "network"],
    [{ message: "unclassified" }, "provider"],
  ] as const)("classifies provider error %j", (failure, expected) => {
    expect(classifyProviderError(failure)).toBe(expected);
  });
  it("does not disclose internal provider messages", () => {
    expect(safeProviderMessage("auth")).not.toContain("401");
    expect(safeProviderMessage("provider")).not.toContain("unclassified");
  });
});

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { translationSystemPrompt } from "./prompt";
import type { TranslationInput, TranslationProvider } from "./provider";
import { languageNames } from "./schema";

export class AnthropicProvider implements TranslationProvider {
  async translate(input: TranslationInput): Promise<unknown> {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 20000, maxRetries: 0 });
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5", max_tokens: 1000,
      system: translationSystemPrompt,
      messages: [{ role: "user", content: JSON.stringify({ text: input.text, sourceLanguage: input.sourceLanguage, sourceLanguageName: languageNames[input.sourceLanguage], targetLanguage: input.targetLanguage, targetLanguageName: languageNames[input.targetLanguage] }) }],
    });
    const content = response.content.find((item) => item.type === "text");
    if (!content || content.type !== "text") throw new Error("empty provider response");
    const json = content.text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) throw new Error("malformed provider response");
    return JSON.parse(json) as unknown;
  }
}

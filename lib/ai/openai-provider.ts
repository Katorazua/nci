import "server-only";
import OpenAI from "openai";
import { translationSystemPrompt } from "./prompt";
import type { TranslationInput, TranslationProvider } from "./provider";
import { languageNames } from "./schema";

export class OpenAIProvider implements TranslationProvider {
  async translate(input: TranslationInput): Promise<unknown> {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 20000, maxRetries: 0 });
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: translationSystemPrompt },
        { role: "user", content: JSON.stringify({ text: input.text, sourceLanguage: input.sourceLanguage, sourceLanguageName: languageNames[input.sourceLanguage], targetLanguage: input.targetLanguage, targetLanguageName: languageNames[input.targetLanguage] }) },
      ],
    });
    const content = response.choices[0]?.message.content;
    if (!content) throw new Error("empty provider response");
    return JSON.parse(content) as unknown;
  }
}

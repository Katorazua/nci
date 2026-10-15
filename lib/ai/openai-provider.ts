import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { translationSystemPrompt } from "./prompt";
import type { TranslationInput, TranslationProvider } from "./provider";
import { languageNames, translationSchema } from "./schema";

export class OpenAIProvider implements TranslationProvider {
  async translate(input: TranslationInput): Promise<unknown> {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 20000, maxRetries: 0 });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      text: { format: zodTextFormat(translationSchema, "court_translation") },
      input: [
        { role: "system", content: translationSystemPrompt },
        { role: "user", content: JSON.stringify({ text: input.text, sourceLanguage: input.sourceLanguage, sourceLanguageName: languageNames[input.sourceLanguage], targetLanguage: input.targetLanguage, targetLanguageName: languageNames[input.targetLanguage] }) },
      ],
    });
    if (!response.output_text) throw new Error("empty provider response");
    return JSON.parse(response.output_text) as unknown;
  }
}

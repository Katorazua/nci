import { z } from "zod";

export const languageSchema = z.enum(["en", "pcm"]);
export const translateRequestSchema = z.object({
  text: z.string().trim().min(1, "Enter text to translate.").max(2000, "Text must be 2,000 characters or fewer."),
  sourceLanguage: languageSchema,
  targetLanguage: languageSchema,
}).refine((value) => value.sourceLanguage !== value.targetLanguage, {
  message: "Choose two different languages.", path: ["targetLanguage"],
});

export const translationSchema = z.object({
  translation: z.string().trim().min(1),
  sourceLanguage: languageSchema,
  targetLanguage: languageSchema,
  warnings: z.array(z.string()).max(5),
  requiresHumanReview: z.boolean(),
});
export type Translation = z.infer<typeof translationSchema>;

export const languageNames = { en: "English", pcm: "Nigerian Pidgin" } as const;

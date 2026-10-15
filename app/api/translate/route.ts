import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { translateRequestSchema, translationSchema } from "@/lib/ai/schema";
import { ProviderError, safeProviderMessage, translateWithProvider } from "@/lib/ai/provider";

export const runtime = "nodejs";
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const requests = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  const now = Date.now();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || "unknown";
  const current = requests.get(key);
  if (current && current.resetAt > now && current.count >= MAX_REQUESTS) {
    return NextResponse.json({ error: "Too many translation requests. Wait a minute and try again." }, { status: 429, headers: { "Retry-After": "60" } });
  }
  requests.set(key, current && current.resetAt > now ? { count: current.count + 1, resetAt: current.resetAt } : { count: 1, resetAt: now + WINDOW_MS });
  if (requests.size > 5000) for (const [ip, value] of requests) if (value.resetAt <= now) requests.delete(ip);

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const parsed = translateRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid translation request." }, { status: 400 });

  try {
    const result = await translateWithProvider(parsed.data);
    const validated = translationSchema.parse(result);
    if (validated.sourceLanguage !== parsed.data.sourceLanguage || validated.targetLanguage !== parsed.data.targetLanguage) {
      return NextResponse.json({ error: "The translation service returned an unexpected language pair. Please retry." }, { status: 502 });
    }
    return NextResponse.json(validated, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ProviderError) {
      const status = error.kind === "unconfigured" ? 503 : error.kind === "rate_limit" || error.kind === "quota" ? 429 : 502;
      return NextResponse.json({ error: safeProviderMessage(error.kind) }, { status });
    }
    if (error instanceof ZodError || error instanceof SyntaxError) return NextResponse.json({ error: "The translation service returned an unreadable response. Please retry." }, { status: 502 });
    return NextResponse.json({ error: "Translation could not be completed. Please try again." }, { status: 502 });
  }
}

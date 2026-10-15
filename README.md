# Nigerian Court Interpreter Support Tool

An AI-assisted communication support MVP for translating simple courtroom procedural instructions and court notices between English and Nigerian Pidgin. It does not replace a certified human interpreter and does not provide authoritative legal translations.

## Requirements

- Node.js 20.9 or newer
- An OpenAI API key (default provider), or an Anthropic API key if selecting Claude

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add the key for your selected provider.
3. Run `npm run dev` and open `http://localhost:3000`.

OpenAI is the default. Set `AI_PROVIDER=openai` and `OPENAI_API_KEY=...`. Optionally set `OPENAI_MODEL`; the default is `gpt-4o-mini`. To use Claude, set `AI_PROVIDER=anthropic`, `ANTHROPIC_API_KEY=...`, and optionally `ANTHROPIC_MODEL` (default `claude-3-5-haiku-latest`). The app will not fall back to another provider. Keys are read only on the server. Never expose them using `NEXT_PUBLIC_` variables.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

The automated tests validate request and structured response schemas. They do not assess translation quality. A small review set is provided in `evaluation/phrases.json`; competent Nigerian Pidgin speakers should assess meaning, tone, ambiguity, and preservation of critical details before any use in court.

## Deployment and safeguards

Set the provider environment variables in the deployment platform. The included rate limiter is in-memory and per process; production deployments with multiple instances should configure a shared rate limiter at the hosting edge or a dedicated service. The application does not store translations or user accounts and avoids logging submitted text. Speech uses the browser SpeechSynthesis API when available; installed voices vary and Nigerian Pidgin pronunciation is not guaranteed.

AI translations may be inaccurate. Have qualified human assistance verify consequential communication, especially pleas, rights, consent, evidence, sentencing, deadlines, dates, names, amounts, negations, or unclear instructions. This MVP does not create official court records, and automated checks do not establish correctness.

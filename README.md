# Nigerian Court Interpreter Support Tool

An offline phrase lookup prototype for predefined courtroom instructions in English and Nigerian Pidgin. The landing page does not send entered text to an AI service. A separate server-side AI translation endpoint remains available for future integration, but the current phrase lookup does not require API credentials.

## Requirements

- Node.js 20.9 or newer

## Setup

1. Install dependencies with `npm install`.
2. Run `npm run dev` and open `http://localhost:3000`.

The landing page uses a local TypeScript phrase dictionary with 40 fixed examples. Select an example to show its stored interpretation, or enter a phrase and choose Interpret phrase to search for an exact match. Matching ignores letter case and repeated whitespace. Other custom sentences and the reverse direction are not supported by the offline page and are not sent to an AI provider. Speech playback uses browser SpeechSynthesis when available; voice availability and Nigerian Pidgin pronunciation vary.

The separate `POST /api/translate` endpoint uses OpenAI Responses API when configured. Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in `.env.local` to use that endpoint directly; these settings do not affect the offline phrase lookup. Keys are read only on the server. Never expose them using `NEXT_PUBLIC_` variables. `GET /api/config` reports key presence without validating the key or contacting OpenAI.

## Checks

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

The automated tests use mocked provider responses and validate request/provider configuration and structured output handling; they do not make paid API calls or assess translation quality. A small review set is provided in `evaluation/phrases.json`; competent Nigerian Pidgin speakers should assess meaning, tone, ambiguity, and preservation of critical details before any use in court.

## Deployment and safeguards

Set the provider environment variables in the deployment platform. The included rate limiter is in-memory and per process; production deployments with multiple instances should configure a shared rate limiter at the hosting edge or a dedicated service. The application does not store translations or user accounts and avoids logging submitted text. Speech uses the browser SpeechSynthesis API when available; installed voices vary and Nigerian Pidgin pronunciation is not guaranteed.

The local examples are not certified or human-reviewed translations. Have qualified human assistance verify consequential communication, especially pleas, rights, consent, evidence, sentencing, deadlines, dates, names, amounts, negations, or unclear instructions. This tool does not create official court records, and automated checks do not establish translation correctness.

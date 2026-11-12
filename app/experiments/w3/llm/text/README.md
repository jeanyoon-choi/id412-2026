# LLM Text

Type a prompt, press Enter, and the model's answer fills the screen in large type. The first LLM example: prompt in, text out.

- Route: /experiments/w3/llm/text
- Week: W3 · Tech: API (Route Handler + OpenAI SDK)
- Inputs: a typed prompt
- Parameters: SYSTEM (the rules for every answer), MODEL, effort (all in `app/api/llm-text/route.ts`)

## How it works
- The page calls `fetch("/api/llm-text")` with `{ prompt }`. It never talks to the model directly.
- `app/api/llm-text/route.ts` runs on the server: it reads `OPENAI_API_KEY` from `.env.local`, asks the model, and returns `{ text }`.
- The key never reaches the browser. `.env.local` is in `.gitignore`.
- While waiting, the old answer fades (`waiting` state). An error from the route is shown as text.

## Run
Put your key in `.env.local` (`OPENAI_API_KEY=...`), restart pnpm dev → open the route.

## Status / next
Written and type-checked; shows the "key is missing" error until a key is in `.env.local`. Next: change SYSTEM so the model becomes a character, or keep the whole conversation and send it each time.

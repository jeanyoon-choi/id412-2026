# LLM Phone to Screen

Type a sentence on the phone; the laptop screen answers it with one strange, poetic line in large type, as if the room itself were speaking. Socket (W2) and LLM (W3) in one chain.

- Route: /experiments/w3/llm/phone-to-screen/mobile (phone) · /experiments/w3/llm/phone-to-screen/screen (laptop)
- Week: W3 · Tech: Socket.io, API (Route Handler + OpenAI SDK)
- Inputs: a typed sentence on the phone (discrete) → screen
- Parameters: SYSTEM (the room's character), MODEL, effort (all in `app/api/llm-phone-to-screen/route.ts`)

## How it works
- Both pages call `useSocket("llm-phone-to-screen", …)`.
- Mobile: a text field. On send: `send("prompt", text)`. The phone never calls the LLM.
- Screen: on a `prompt` message it shows the sentence small, then calls `fetch("/api/llm-phone-to-screen")`.
- The route runs on the server with the key from `.env.local`, asks the model, returns `{ text }`. The screen shows it large.
- Only the screen calls the API, so with several phones there is still one place that spends tokens.

## Run
Put your key in `.env.local` (`OPENAI_API_KEY=...`), restart pnpm dev → open /screen and click the /mobile link in its corner. With a phone: pnpm dev:mobile, accept the warning at :4000 and :3000 on the phone, same Wi-Fi.

## Status / next
Written and type-checked; the socket part works without a key, the answer needs one. Next: change SYSTEM, or ask for parameters (see `llm/parameters`) and drive a visual with what visitors type.

# Typing

Type a sentence on the phone. On the laptop, eight phones show eight chat apps (a KakaoTalk group, iMessage with Mom, a Slack channel, Instagram DMs, a family WhatsApp group, a Discord server, a Telegram channel, LINE): your draft appears in every composer letter by letter, the sentence is sent in all of them at once, and every room answers in its own voice.

- Route: /experiments/w2/typing/mobile (phone) · /experiments/w2/typing/screen (laptop)
- Week: W2 · Tech: Socket.io, HTML/CSS (app clones), API (Route Handler + OpenAI SDK, optional)
- Inputs: the draft, key by key (continuous), the sent sentence (discrete) → screen
- Parameters: the rooms in `apps.ts` (friends, earlier lines, `persona`, `dummies`), SLOWEST (3200 ms), COLUMNS × ROWS (4 × 2)

## How it works
- Both pages call `useSocket("typing", …)`.
- Mobile: a message composer. Every change of the text field sends `typing` with the whole draft; the send button sends `message`.
- Screen: `apps.ts` describes the eight rooms; `Phone.tsx` draws one room at an iPhone's real size (390 × 844 points) and the page zooms it to fit; each app's look is one block of CSS variables in `phone.module.css`.
- On `message` the sentence is added to all eight threads, then the screen asks `app/api/typing/route.ts` for one answer per room.
- With `OPENAI_API_KEY` in `.env.local` the route asks the model (structured output: one reply per room id, written in that room's `persona`). Without a key, or on any error, the screen uses each room's `dummies` instead.
- The answers do not arrive together: each room shows "•••" and answers after its own random delay.

## Run
pnpm dev → open /screen and click the /mobile link in its corner (new tab); type there. With a phone: open the same address with your computer's IP. For LLM answers: `OPENAI_API_KEY=...` in `.env.local`, restart pnpm dev.

## Status / next
Written and type-checked; the draft and the eight rooms were checked in the browser. The LLM path was not run with a working key. Next: your own rooms, or let each room keep its whole conversation and send it to the model.

# LLM Parameters

Describe a mood or a scene ("a storm at sea", "Sunday morning") and a field of drifting circles changes colour, number, size and nervousness to match. The model does not answer with a sentence but with numbers.

- Route: /experiments/w3/llm/parameters
- Week: W3 · Tech: API (Route Handler + OpenAI SDK, structured output), Canvas
- Inputs: a typed prompt
- Parameters: hue, spread, count, size, speed, wobble (chosen by the model), EASE (0.03, page)

## How it works
- The page sends `{ prompt }` to `app/api/llm-parameters/route.ts`.
- The route gives the model a JSON schema (`SCHEMA`) with `text.format`. The answer is always JSON in that shape: `{ hue, spread, count, size, speed, wobble, title }`.
- The page clamps every number to its range, stores them as the target, and shows the raw JSON top-left.
- The `requestAnimationFrame` loop eases the drawn parameters toward the target, so the picture glides to the new mood.
- The LLM here is the "parameter conversion" step: language in, parameters out.

## Run
Put your key in `.env.local` (`OPENAI_API_KEY=...`), restart pnpm dev → open the route. Without a key the circles still drift with the starting parameters.

## Status / next
Written and type-checked; the canvas runs, the model call needs a key. Next: add your own parameter to `SCHEMA` and use it in `draw()`, or drive a Tone.js synth with the same numbers.

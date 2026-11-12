import OpenAI from "openai";

// A Route Handler: this file runs on the server, never in the browser.
// The page sends { prompt }, we ask the model, and send back { text }.
// The key is read from .env.local (OPENAI_API_KEY) and stays on the server.
const MODEL = "gpt-6.1-sol";
const SYSTEM = "Answer in one or two short sentences."; // the rules the model follows for every prompt

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OPENAI_API_KEY is missing. Put it in .env.local and restart pnpm dev." }, { status: 500 });
  }

  const { prompt } = await request.json();
  const client = new OpenAI(); // picks up OPENAI_API_KEY by itself

  try {
    const response = await client.responses.create({
      model: MODEL,
      reasoning: { effort: "low" }, // low = think less, answer faster
      instructions: SYSTEM,
      input: prompt,
    });
    return Response.json({ text: response.output_text });
  } catch (error) {
    const reason = error instanceof OpenAI.APIError ? error.message : "request failed";
    return Response.json({ error: reason }, { status: 500 });
  }
}

import OpenAI from "openai";

// Runs on the server. The screen page sends { prompt } (typed on the phone),
// we ask the model, and send back { text }. The key stays in .env.local.
const MODEL = "gpt-6.1-sol";
const SYSTEM = "You are the voice of a dark room. Whatever the visitor says, answer with one short, strange, poetic sentence. No quotes, no explanations.";

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

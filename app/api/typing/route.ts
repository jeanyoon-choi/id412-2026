import OpenAI from "openai";

// Runs on the server. The screen sends what was typed on the mobile and the list of chat rooms;
// the model writes one answer per room, each in that room's voice.
// No key in .env.local (or any error): the screen falls back to its own dummy answers.
const MODEL = "gpt-6.1-sol";
const SYSTEM =
  "The same person just sent the same message in several messaging apps at once. " +
  "For each room, write ONE short reply (at most 20 words) from the other side, in that room's voice and language.";

const SCHEMA = {
  type: "object",
  properties: {
    replies: {
      type: "array",
      items: {
        type: "object",
        properties: { app: { type: "string", description: "the room's id" }, text: { type: "string" } },
        required: ["app", "text"],
        additionalProperties: false,
      },
    },
  },
  required: ["replies"],
  additionalProperties: false,
};

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OPENAI_API_KEY is missing: using dummy answers." }, { status: 500 });
  }

  const { text, rooms } = await request.json(); // rooms: [{ app, persona }]
  const client = new OpenAI();

  try {
    const response = await client.responses.create({
      model: MODEL,
      reasoning: { effort: "low" },
      instructions: SYSTEM,
      input: JSON.stringify({ message: text, rooms }),
      text: { format: { type: "json_schema", name: "replies", schema: SCHEMA, strict: true } },
    });
    return Response.json(JSON.parse(response.output_text));
  } catch (error) {
    const reason = error instanceof OpenAI.APIError ? error.message : "request failed";
    return Response.json({ error: reason }, { status: 500 });
  }
}

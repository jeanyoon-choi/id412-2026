import OpenAI from "openai";

// Runs on the server. The page sends { prompt } ("a storm at sea"), and the model
// answers not with a sentence but with numbers: the parameters of the visual.
// "Structured output": we give a JSON schema, the answer always has that shape.
const MODEL = "gpt-6.1-sol";
const SYSTEM = "You turn a word, mood or scene into parameters for an abstract visual of drifting circles on black. Be bold: use the whole range.";

const SCHEMA = {
  type: "object",
  properties: {
    hue: { type: "number", description: "main colour, 0 to 360 (0 red, 120 green, 240 blue)" },
    spread: { type: "number", description: "how far colours stray from the main hue, 0 (one colour) to 180 (rainbow)" },
    count: { type: "integer", description: "number of circles, 5 to 300" },
    size: { type: "number", description: "circle radius in px, 2 to 120" },
    speed: { type: "number", description: "0 (still) to 1 (frantic)" },
    wobble: { type: "number", description: "0 (straight lines) to 1 (nervous, shaking)" },
    title: { type: "string", description: "a two or three word title for this picture" },
  },
  required: ["hue", "spread", "count", "size", "speed", "wobble", "title"],
  additionalProperties: false,
};

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "OPENAI_API_KEY is missing. Put it in .env.local and restart pnpm dev." }, { status: 500 });
  }

  const { prompt } = await request.json();
  const client = new OpenAI();

  try {
    const response = await client.responses.create({
      model: MODEL,
      reasoning: { effort: "low" },
      instructions: SYSTEM,
      input: prompt,
      text: { format: { type: "json_schema", name: "parameters", schema: SCHEMA, strict: true } },
    });

    // The text is JSON in the shape of SCHEMA: turn it into an object.
    return Response.json({ parameters: JSON.parse(response.output_text) });
  } catch (error) {
    const reason = error instanceof OpenAI.APIError ? error.message : "request failed";
    return Response.json({ error: reason }, { status: 500 });
  }
}

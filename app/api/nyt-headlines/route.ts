// A Route Handler: this file runs on the server, never in the browser.
// The New York Times API needs a key. The key is read from .env.local (NYT_API_KEY)
// and stays here: the page only gets the headlines back.
export async function GET() {
  const key = process.env.NYT_API_KEY;
  if (!key) {
    return Response.json({ error: "NYT_API_KEY is missing. Put it in .env.local and restart pnpm dev." }, { status: 500 });
  }

  const response = await fetch(`https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${key}`);
  if (!response.ok) {
    return Response.json({ error: `The New York Times API answered ${response.status}` }, { status: 500 });
  }

  // Keep only what the page needs.
  const data = await response.json();
  const headlines = data.results.map((story: { title: string; section: string }) => ({ title: story.title, section: story.section }));
  return Response.json({ headlines });
}

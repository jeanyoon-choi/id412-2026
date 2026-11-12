import { llmsTxt } from "@/app/lecture-materials/seo/llms";

// /llms.txt: this site in plain text, for LLMs. Part of the lecture site.
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

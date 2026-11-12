import { llmsFullTxt } from "@/app/lecture-materials/seo/llms";

// /llms-full.txt: the full text of the notes, for LLMs. Part of the lecture site.
export const dynamic = "force-static";

export function GET() {
  return new Response(llmsFullTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

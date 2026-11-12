import { noteMarkdown } from "@/app/lecture-materials/seo/notes-text";
import { SITE_URL, notes } from "@/app/lecture-materials/seo/site";

// /lecture-materials/md/w2.en.md: one page of notes as Markdown, for LLMs.
// Search engines are sent to the page itself (canonical), not to this file.
export const dynamicParams = false;

export function generateStaticParams() {
  return notes.flatMap((page) => [{ file: `${page.slug}.en.md` }, { file: `${page.slug}.ko.md` }]);
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const [slug, lang] = file.split(".");
  const page = notes.find((item) => item.slug === slug);
  if (!page || (lang !== "en" && lang !== "ko")) return new Response("Not found", { status: 404 });
  return new Response(noteMarkdown(page.slug, lang), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${SITE_URL}${page.path}>; rel="canonical"`,
      "X-Robots-Tag": "noindex, follow",
    },
  });
}

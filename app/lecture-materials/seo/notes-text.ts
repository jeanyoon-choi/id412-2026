import { readFileSync } from "node:fs";
import { join } from "node:path";
import { terms, type TermId } from "../components/term/glossary";
import type { Note } from "./site";

// The notes as plain Markdown, made from en.mdx / ko.mdx themselves so the
// text can never differ from the page. Only what Markdown cannot hold is
// removed: imports, figures and diagrams. A <Term> becomes its word.
export function noteMarkdown(slug: Note["slug"], lang: "en" | "ko") {
  const source = readFileSync(join(process.cwd(), "app", "lecture-materials", slug, `${lang}.mdx`), "utf8");
  const kept: string[] = [];
  let inFigure = false;
  let inCode = false;
  for (const line of source.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) inCode = !inCode;
    if (inCode || trimmed.startsWith("```")) {
      kept.push(line);
      continue;
    }
    if (trimmed.startsWith("import ")) continue;
    if (inFigure) {
      if (trimmed === "/>") inFigure = false;
      continue;
    }
    if (/^<[A-Z][A-Za-z]*\b/.test(trimmed) && !trimmed.startsWith("<Term")) {
      if (!trimmed.endsWith("/>")) inFigure = true;
      continue;
    }
    kept.push(line);
  }
  return kept
    .join("\n")
    .replace(/<Term id="([A-Za-z0-9]+)"\s*\/>/g, (_, id: string) => terms[id as TermId]?.name ?? id)
    .replace(/<Term id="[A-Za-z0-9]+">([\s\S]*?)<\/Term>/g, "$1")
    .replace(/<[A-Z][A-Za-z]*\b[^>]*\/>/g, "")
    .replace(/<span className="[a-z]+">([\s\S]*?)<\/span>/g, "$1")
    .replace(/[ \t]*\[#[A-Za-z0-9_-]+\][ \t]*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

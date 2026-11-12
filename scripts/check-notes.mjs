// Checks that every lecture page says the same thing in both languages:
// en.mdx and ko.mdx must have the same structure, line for line.
// Run: pnpm check:notes
import { existsSync, readFileSync, readdirSync } from "node:fs";

const ROOT = "app/lecture-materials";

// What kind of line is this? The words differ between the languages; the kind must not.
function kind(line) {
  const text = line.trim();
  if (text === "") return "blank";
  if (text.startsWith("```")) return "code fence";
  if (text.startsWith("import ")) return text; // imports must be identical
  if (/^#{1,6} /.test(text)) return `heading ${text.match(/^#+/)[0].length}`;
  if (/^<\/?[A-Z]/.test(text)) return text; // a component line must be identical
  if (text.startsWith("|")) return `table row with ${text.split("|").length - 2} cells`;
  if (/^[-*] /.test(text)) return `bullet at indent ${line.search(/\S/)}`;
  if (/^\d+\. /.test(text)) return `numbered item at indent ${line.search(/\S/)}`;
  return "text";
}

let problems = 0;
for (const page of readdirSync(ROOT)) {
  const en = `${ROOT}/${page}/en.mdx`;
  const ko = `${ROOT}/${page}/ko.mdx`;
  if (!existsSync(en) || !existsSync(ko)) continue;
  const a = readFileSync(en, "utf8").split("\n");
  const b = readFileSync(ko, "utf8").split("\n");
  let inCode = false;

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const [one, other] = [a[i] ?? "", b[i] ?? ""];
    const fence = one.trim().startsWith("```");
    if (!inCode || fence) {
      if (kind(one) !== kind(other)) {
        console.log(`${page} line ${i + 1}: en is "${kind(one)}", ko is "${kind(other)}"\n  en: ${one.trim().slice(0, 90)}\n  ko: ${other.trim().slice(0, 90)}`);
        if (++problems >= 20) break; // after the first shift every line differs: stop early
      }
      // Link targets are the same in both languages, and so is the number of pieces of inline code.
      const parts = (line) => [...(line.match(/\]\([^)]*\)/g) ?? []).sort(), (line.match(/`[^`]+`/g) ?? []).length].join(" ");
      if (kind(one) === kind(other) && parts(one) !== parts(other)) {
        console.log(`${page} line ${i + 1}: links or inline code differ\n  en: ${parts(one).slice(0, 110)}\n  ko: ${parts(other).slice(0, 110)}`);
        problems++;
      }
    }
    // A Korean heading needs the English id, or links to that section do not work in Korean.
    if (!inCode && /^#{2,6} /.test(other) && /[^\x00-\x7F]/.test(other) && !/\[#[A-Za-z0-9_-]+\]\s*$/.test(other)) {
      console.log(`${page} line ${i + 1}: the Korean heading has no [#id]\n  ko: ${other.trim()}`);
      problems++;
    }
    if (fence) inCode = !inCode;
  }
  if (a.length !== b.length) console.log(`${page}: en has ${a.length} lines, ko has ${b.length}`);
}

console.log(problems ? `\n${problems} difference(s). Make ko.mdx follow en.mdx (or the other way round).` : "en and ko match on every page.");
process.exit(problems ? 1 : 0);

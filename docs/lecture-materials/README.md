# Lecture website — how it is built and how to edit it

Read this before changing anything under `app/lecture-materials/`, `public/lecture-materials/`, `app/layout.tsx`, `app/globals.css` or `app/page.tsx`. Students never edit these; the instructor and the TA do. The deployed site (id412.xdlab.net) is always the latest version; student clones keep whatever they cloned.

## Layout

```
app/lecture-materials/
  components/                 everything the lecture site needs, one folder per component
    sidebar/                  left navigation + per-page table of contents (reads h2[id] of the visible language)
    lang/                     EN / 한국어 switch (lang.tsx), <LangBlock> and <L> wrappers (lang-block.tsx)
    theme-toggle/             light / dark switch
    back-to-top/              bottom-right button
    term/                     <Term id="..."> clickable glossary keyword + glossary.ts (the data)
    image-row/                <ImageRow items={[...]} /> row of captioned images
    capability-chart/         the METR time-horizon chart on Prelim
    stack-diagram/            the layered frontend-stack figure on W1
    hash-scroll/              makes "#section" links land on the visible language's section (both languages share ids)
    socket-diagram/           two figures: what runs on port 3000 and 4000, and the five workflow steps in order (W2 §3)
    parameter-diagram/        input → parameter → output mapping schematic (W2 §2)
    device-diagram/           <DeviceDiagram work="banpo-xism | omega | sota" />: a clip of the work next to how it works, mobile → system → screens (W2 §4)
    sensor-motion/            <SensorMotion kind="tilt | shake | microphone | camera" />: a small animated drawing of the hand and the mobile (W2 §6)
    experiment-index/         scans app/experiments on the server and lists them (/experiments, /experiments/<week>); a multi-device experiment gets one indented row per device
    collapsible/              makes every h2 section and bold run-in subsection expand/collapse (DOM-only, nothing moves)
    code-block/               <pre> with a Copy button (every fenced code block)
    shell/                    LectureShell: sidebar + main column, used by the index and lecture pages only
    mdx/                      MDX element overrides (external links, [#id] headings) + the *.mdx type declaration
  seo/                        what search engines and LLMs read, nothing visible: site.ts (the facts and descriptions), metadata.ts (head tags), json-ld.tsx (schema.org), experiment.ts (an experiment's title from its README), llms.ts + notes-text.ts (/llms.txt, /llms-full.txt, the notes as Markdown)
  md/[file]/route.ts          /lecture-materials/md/w2.en.md: one page of notes as Markdown
  prelim/ w1/ w2/ w3/
    page.tsx                  renders <En /> and <Ko /> inside <LangBlock>; metadata title
    en.mdx                    English notes
    ko.mdx                    Korean notes, same structure and same section ids
public/lecture-materials/<page>/        images used by that page (small: webp, <= 1280px)
docs/
  lecture-materials/README.md           this file
  experiments/README.md       student experiments guide
  final/README.md             final project guide
  sources/                    syllabus and source material
  handoff.md                  planning notes, gitignored
```

`app/robots.ts`, `app/sitemap.ts`, `app/llms.txt/` and `app/llms-full.txt/` belong to the lecture site as well; Next.js requires them at the root of `app/`. SEO work never changes what a page shows: titles, text and the README stay as they are.

The index page (`app/page.tsx`) and the shell (`app/layout.tsx`, `app/globals.css`, `app/layout.module.css`) are part of the lecture site too. The root `mdx-components.tsx` only re-exports from `components/mdx/` because Next.js requires that file at the root.

## Philosophy: do not over-confuse students

- Teach the pipeline we actually use (Node.js, pnpm, Next.js App Router, React, CSS Modules, Claude Code). Name an alternative once so students recognise it in the wild, then move on. No comparison tables of things we will never touch.
- A concept earns a paragraph only if a student will meet it in this workshop. Otherwise it is a `Term` (one click, two sentences) or nothing.
- Prefer one way of doing something. If two ways are both fine (template vs. from scratch for the final), say so in one line, not two sections.
- Short lines, concrete commands, the same words every time (`pnpm dev`, `app/experiments/...`). Jargon gets a `Term`, not a lecture.

## Writing for the reader

The reader is a design student who is new to code and hears each thing for the first time. These rules come from mistakes that were made in these notes; follow them on every edit.

1. Before writing a section, decide three things: what the student already knows at this point, what they must be able to do after it, and the order in between. Write in that order. Never use a term, a tool or a step before the place where it is introduced.
2. Write from the student's seat, not the builder's. Say what something is for and why it is needed before how this repo implements it. "The relay needs a computer that stays on, because …" comes before any file name, port or setting.
3. Write only what the instructor wrote or asked for. No added advice, asides, encouragement, recommendations ("if you want …"), summaries or filler. If a sentence was not asked for and carries no instruction, leave it out. Do not delete the instructor's own sentences either: ask.
4. `→` means a flow only: a message going from one device to another, or one step after another. Not "is", not "does", not "opens at". Use a colon or a table for those.
5. A file, command or term the student has not met gets a `Term` (dotted underline) or a half-sentence saying what it is. Never a bare `.gitignore`.
   A reference to another section is a link to it: `[§5](#5-mobile-https-debugging)` on the same page, `[W1 §12](/lecture-materials/w1#12-deployment)` across pages. The ids are the same in both languages.
6. Say "mobile", never "phone". The same word for the same thing on every page.
7. After writing, read the whole section once from the top as that student. Then check it in the browser, in both languages. A page that renders is not yet a page that can be followed.
8. A change is finished when the whole section still reads in order, not when one line is fixed.

## Writing notes (MDX)

- Markdown + GFM (tables, autolinked URLs). Bare URLs become links. External links open in a new tab automatically.
- MDX gotcha: `<`, `{` and `}` in prose break the parser. Put them in backticks.
- A JSX block (`<ImageRow ... />`, `<CapabilityChart />`) needs a blank line before and after it. Inside a list item, indent it to the item's text and keep the blank lines.
- Style: English notes keep the 2025 voice (numbered sections, bold run-in subheads, nested bullets, short lines). Korean mirrors it.

## Two languages

- Every page has `en.mdx` and `ko.mdx`. Both are rendered; CSS shows the one matching `<html data-lang>`. The switch is in the sidebar and is remembered in localStorage.
- Section ids must match across languages so links and the glossary work. English ids come from the heading text (github-slugger: `## 6. Schedule & Assignments` → `6-schedule--assignments`). In Korean, end the heading with the English id in brackets: `## 6. 일정과 과제 [#6-schedule--assignments]`. The bracket is stripped on render.
- When you add or rename a section in `en.mdx`, do the same in `ko.mdx` and update any `related` links in `glossary.ts` that point at it.
- Short bilingual strings inside TSX: `<L en="..." ko="..." />`.

### Korean is written, not translated

The notes change often. Every change to `en.mdx` is made in `ko.mdx` in the same edit, never later.

- Read the English for its meaning, then say that meaning the way a Korean instructor would write lecture notes. Do not map sentence to sentence, word to word.
  - Bad: "앱만 호스팅한다. relay는 없다" · Good: "Vercel은 Next.js 앱은 실행해 주지만 relay는 실행하지 못한다"
  - Bad: "이게 루프를 닫는다" · Good: "그러면 작업 루프가 완성된다"
- Register: plain "~한다 / ~이다", short sentences. No "너/네/당신", no "~해라": leave the subject out, or say "내 컴퓨터".
- No English-style colon chains, no "~하는 것이다", no literal passives, no stacked nouns.
- Keep in English what Korean developers say in English (relay, room, socket, hook, shader, API key, prompt, agent); Korean for the rest (배포, 서버, 브라우저, 터미널, 인증서). Button labels and product names stay as they are on screen.
- Same structure as `en.mdx`, line for line: same headings, bullets, numbers, tables, components, links and code. `pnpm check:notes` verifies this; run it after every edit of the notes.
- Glossary (`glossary.ts`) `ko` texts follow the same rules.

## Glossary (Term)

- `components/term/glossary.ts` holds every keyword: name, `en`/`ko` `{ what, use }`, `official` link, `learn` links, `related` links into the notes.
- Use it in MDX as `<Term id="pnpm" />` (renders the name) or `<Term id="api">APIs</Term>` (custom text). The word is dotted-underlined; clicking expands the explanation under that line in the current language.
- Add a term when a concept recurs across pages. Keep `what` to two or three sentences and `use` specific to this workshop.

## Images

- Put files in `public/lecture-materials/<page>/`, reference as `/lecture/<page>/<file>`. Keep them small (webp at 640–1280px). Record the licence in the caption when it is not ours (CC BY, public domain, etc.).
- `<ImageRow items={[{ src, alt, caption, href }]} />` for a row of images (two per row, click to enlarge in a lightbox); add `wide` for a single full-width one, `logos` for a row of small logos (SVGs in `public/lecture-materials/w1/logo-*.svg`, from Wikimedia Commons, licence noted in git history).
- Screenshots of the scratch app and the VS Code terminal live in `public/lecture-materials/w1/`. Re-take them when the UI changes.

## Checks

- `pnpm check:notes` must pass: `en.mdx` and `ko.mdx` have the same structure on every page.
- `pnpm typecheck` and `pnpm build` must pass. `pnpm dev` is usually running on :3000; reload the page and check both languages, light and dark.
- The chart's data is hand-entered in `capability-chart.tsx` with its source; update numbers and the source line together.

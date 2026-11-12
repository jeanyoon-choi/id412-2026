import { allExperiments } from "./experiment";
import { noteMarkdown } from "./notes-text";
import { REPO_URL, SITE_URL, notes } from "./site";
import { weekLabel } from "../components/experiment-index/experiments";

// /llms.txt and /llms-full.txt: the site described for LLMs, in plain text.
// Facts only, each one already on the site.

function header() {
  return [
    "# ID412 Interactive Space — Web Workshop",
    "",
    "> Lecture notes and experiments of the Web Workshop of Interactive Space (ID412), a class of the KAIST Dept. of Industrial Design, Fall 2026. Three creative frontend web development sessions.",
    "",
    "KAIST 산업디자인학과 Interactive Space (ID412) 수업의 웹 워크숍 강의 노트와 실험. 2026년 가을, 크리에이티브 프론트엔드 웹 개발 세션 세 번.",
    "",
    "- Professor: Yiyun Kang (강이연), https://yiyunkang.com/",
    "- Teaching Assistant, author of these notes: Jeanyoon Choi (최정윤), PhD Candidate, Experience Design Lab (XD Lab) @ KAIST Dept. of Industrial Design. https://jeanyoon.ch/oi · https://www.xdlab.net/people/jeanyoon-choi",
    "- Lab: XD Lab (KAIST Experience Design Lab, 경험디자인연구실), https://www.xdlab.net/",
    "- Research topic of the TA: Multi-Device Web Artwork",
    `- Code (GitHub template): ${REPO_URL}`,
    "- Stack: Next.js (App Router), React, TypeScript, CSS Modules, Canvas, GLSL, Three.js, Socket.io, Tone.js, VS Code + Claude Code",
    "",
    "The notes are written in English and Korean. Both languages are on the same address; the Markdown links below give each language separately.",
  ];
}

function noteList() {
  return [
    "## Lecture notes",
    "",
    ...notes.map(
      (page) =>
        `- [${page.name}](${SITE_URL}${page.path})${page.date ? ` (${page.date})` : ""}: ${page.en}. ${page.ko}. Markdown: [English](${SITE_URL}/lecture-materials/md/${page.slug}.en.md), [한국어](${SITE_URL}/lecture-materials/md/${page.slug}.ko.md)`,
    ),
  ];
}

function experimentList() {
  const lines = ["## Experiments", "", `Every experiment is a page of this site and a folder in the repository (app/experiments/). Index: ${SITE_URL}/experiments`];
  let week = "";
  for (const experiment of allExperiments()) {
    if (experiment.week !== week) {
      week = experiment.week;
      lines.push("", `### ${weekLabel(week)}`, "");
    }
    lines.push(`- [${experiment.title}](${SITE_URL}${experiment.href}): ${experiment.description}`);
  }
  return lines;
}

const works = [
  "## XD Lab works referred to in the notes",
  "",
  "- Passage of Water (2023): https://www.xdlab.net/projects/passage-of-water",
  "- SoTA (2024): https://www.xdlab.net/projects/sota",
  "- Uncharted Territory (2024): https://www.xdlab.net/projects/uncharted-territory",
  "- Ω (2025): https://www.xdlab.net/projects/omega",
  "- Banpo-Xism (2026): https://www.xdlab.net/projects/banpo-xism",
];

export function llmsTxt() {
  return [...header(), "", ...noteList(), "", ...experimentList(), "", ...works, "", "## Optional", "", `- [Full text of all notes](${SITE_URL}/llms-full.txt)`, ""].join("\n");
}

export function llmsFullTxt() {
  const parts = [...header(), "", ...experimentList(), "", ...works];
  for (const page of notes) {
    for (const lang of ["en", "ko"] as const) {
      parts.push("", "---", "", `Source: ${SITE_URL}${page.path} (${lang === "en" ? "English" : "한국어"})`, "", noteMarkdown(page.slug, lang));
    }
  }
  return parts.join("\n") + "\n";
}

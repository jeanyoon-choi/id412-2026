import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

// Scans app/experiments/<week>/<name>/ at build time. An experiment is any
// folder with a page.tsx, or with mobile/ and screen/ pages. The description
// is the first paragraph after the title of its README.md.

export type Experiment = {
  week: string;
  name: string;
  href: string;
  description: string;
  multiDevice: boolean;
  updated: string; // YYYY-MM-DD, from the newest file in the folder
};

const ROOT = join(process.cwd(), "app", "experiments");

function describe(dir: string) {
  const readme = join(dir, "README.md");
  if (!existsSync(readme)) return "";
  const lines = readFileSync(readme, "utf8").split("\n");
  const start = lines.findIndex((line) => line.startsWith("# ")) + 1;
  const body = lines.slice(start).map((line) => line.trim());
  const first = body.findIndex((line) => line.length > 0);
  if (first < 0) return "";
  const end = body.findIndex((line, index) => index > first && line.length === 0);
  return body.slice(first, end < 0 ? undefined : end).join(" ");
}

function newest(dir: string): number {
  let latest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    const time = entry.isDirectory() ? newest(path) : statSync(path).mtimeMs;
    if (time > latest) latest = time;
  }
  return latest;
}

export function listWeeks(): string[] {
  if (!existsSync(ROOT)) return [];
  return readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^w\d+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

export function listExperiments(week: string): Experiment[] {
  const dir = join(ROOT, week);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const folder = join(dir, entry.name);
      const single = existsSync(join(folder, "page.tsx"));
      const multi = existsSync(join(folder, "mobile", "page.tsx")) && existsSync(join(folder, "screen", "page.tsx"));
      if (!single && !multi) return null;
      return {
        week,
        name: entry.name,
        href: `/experiments/${week}/${entry.name}${multi && !single ? "/screen" : ""}`,
        description: describe(folder),
        multiDevice: multi,
        updated: new Date(newest(folder)).toISOString().slice(0, 10),
      };
    })
    .filter((item): item is Experiment => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

const labels: Record<string, string> = {
  w1: "w1 · creative coding",
  w2: "w2 · cross-device",
  w3: "w3 · integrating system",
};

export function weekLabel(week: string) {
  return labels[week] ?? week;
}

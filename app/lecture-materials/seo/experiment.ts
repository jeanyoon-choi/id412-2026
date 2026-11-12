import type { Metadata } from "next";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { listExperiments, listWeeks } from "../components/experiment-index/experiments";
import { pageMetadata } from "./metadata";

// An experiment's title is the "# Title" line of its README.md, and its
// description is the first paragraph (the same one the index page shows).

function readmeTitle(name: string) {
  const readme = join(process.cwd(), "app", "experiments", name, "README.md");
  if (!existsSync(readme)) return "";
  const line = readFileSync(readme, "utf8")
    .split("\n")
    .find((text) => text.startsWith("# "));
  return line ? line.slice(2).trim() : "";
}

export function allExperiments() {
  return listWeeks().flatMap((week) =>
    listExperiments(week).map((experiment) => {
      const path = `${week}/${experiment.name}`;
      return { ...experiment, path, title: readmeTitle(path) || experiment.name };
    }),
  );
}

/** For an experiment's layout.tsx: experimentMetadata("w2/drawing"). */
export function experimentMetadata(path: string): Metadata {
  const experiment = allExperiments().find((item) => item.path === path);
  if (!experiment) return {};
  return pageMetadata(`${experiment.title} · ID412`, experiment.description, experiment.href);
}

import type { MetadataRoute } from "next";
import { allExperiments } from "./lecture-materials/seo/experiment";
import { SITE_URL, notes } from "./lecture-materials/seo/site";
import { listWeeks } from "./lecture-materials/components/experiment-index/experiments";

// /sitemap.xml: the index, the notes, and every experiment. Part of the lecture site.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    ...notes.map((page) => page.path),
    "/experiments",
    ...listWeeks().map((week) => `/experiments/${week}`),
    ...allExperiments().map((experiment) => experiment.href),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}

import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, notes, type Note } from "./site";

// Head tags of one page: the title as it already was, a description, the
// canonical address (always on id412.xdlab.net, so that copies of this
// template on other domains point back here) and the share preview.
export function pageMetadata(title: string, description: string, path: string, markdown?: Record<string, string>): Metadata {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical: url, ...(markdown ? { types: markdown } : {}) },
    openGraph: { type: "website", siteName: SITE_NAME, title, description, url, locale: "en_US", alternateLocale: ["ko_KR"] },
    twitter: { card: "summary", title, description },
  };
}

export function noteMetadata(slug: Note["slug"]): Metadata {
  const page = notes.find((item) => item.slug === slug)!;
  return pageMetadata(page.title, page.description, page.path, {
    "text/markdown": `${SITE_URL}/lecture-materials/md/${slug}.en.md`,
  });
}

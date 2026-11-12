import type { MetadataRoute } from "next";
import { SITE_URL } from "./lecture-materials/seo/site";

// /robots.txt: search engines and LLM crawlers may read every page. Part of the lecture site.
const CRAWLERS = [
  "Googlebot",
  "Bingbot",
  "Yeti",
  "Daumoa",
  "DuckDuckBot",
  "Applebot",
  "Applebot-Extended",
  "Google-Extended",
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "PerplexityBot",
  "Perplexity-User",
  "Meta-ExternalAgent",
  "MistralAI-User",
  "DuckAssistBot",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: CRAWLERS, allow: "/", disallow: "/api/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

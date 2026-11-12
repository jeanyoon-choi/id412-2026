import { experimentMetadata } from "@/app/lecture-materials/seo/experiment";

// The browser tab title and the description for search engines, read from this folder's README.md.
export const metadata = experimentMetadata("w3/system/fish-food");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";
import { LangBlock } from "@/app/lecture-materials/components/lang/lang-block";
import En from "./en.mdx";
import Ko from "./ko.mdx";
import { NoteJsonLd } from "@/app/lecture-materials/seo/json-ld";
import { noteMetadata } from "@/app/lecture-materials/seo/metadata";

export const metadata: Metadata = noteMetadata("w1");

// Both languages are rendered; the EN / 한국어 switch in the sidebar shows one.
export default function Page() {
  return (
    <>
      <NoteJsonLd slug="w1" />
      <LangBlock lang="en">
        <En />
      </LangBlock>
      <LangBlock lang="ko">
        <Ko />
      </LangBlock>
    </>
  );
}

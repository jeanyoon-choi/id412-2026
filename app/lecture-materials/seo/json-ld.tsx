import { ORG_DEPARTMENT, ORG_XDLAB, PERSON_PROFESSOR, PERSON_TA, REPO_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL, notes, type Note } from "./site";

// Structured data (schema.org) in a <script> tag. Read by search engines and
// LLMs, never drawn on the page.
function JsonLd({ graph }: { graph: object[] }) {
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

const WEBSITE_ID = `${SITE_URL}/#website`;
const COURSE_ID = `${SITE_URL}/#course`;

const ta = { ...PERSON_TA, affiliation: ORG_XDLAB };

function noteNode(page: Note) {
  return {
    "@type": "LearningResource",
    "@id": `${SITE_URL}${page.path}#notes`,
    name: page.name,
    description: `${page.en}. ${page.ko}.`,
    url: `${SITE_URL}${page.path}`,
    learningResourceType: "Lecture notes",
    inLanguage: ["en", "ko"],
    isAccessibleForFree: true,
    author: { "@id": PERSON_TA["@id"] },
    isPartOf: [{ "@id": WEBSITE_ID }, { "@id": COURSE_ID }],
  };
}

/** Index page: the site, the course it belongs to, the people, the four notes. */
export function SiteJsonLd() {
  return (
    <JsonLd
      graph={[
        {
          "@type": "WebSite",
          "@id": WEBSITE_ID,
          name: SITE_NAME,
          alternateName: "ID412 Interactive Space — Web Workshop",
          description: SITE_DESCRIPTION,
          url: SITE_URL,
          inLanguage: ["en", "ko"],
          author: { "@id": PERSON_TA["@id"] },
          publisher: { "@id": ORG_XDLAB["@id"] },
          hasPart: notes.map((page) => ({ "@id": `${SITE_URL}${page.path}#notes` })),
        },
        {
          "@type": "Course",
          "@id": COURSE_ID,
          name: "Interactive Space",
          courseCode: "ID412",
          description: "Interactive Space (ID412), KAIST Dept. of Industrial Design. This site is its Web Workshop: three creative frontend web development sessions.",
          url: SITE_URL,
          provider: ORG_DEPARTMENT,
          hasCourseInstance: {
            "@type": "CourseInstance",
            name: "Fall 2026",
            courseMode: "onsite",
            instructor: PERSON_PROFESSOR,
            contributor: { "@type": "Role", roleName: "Teaching Assistant", contributor: { "@id": PERSON_TA["@id"] } },
          },
        },
        ta,
        ORG_XDLAB,
        ...notes.map(noteNode),
        { "@type": "SoftwareSourceCode", name: "id412-2026", codeRepository: REPO_URL, isPartOf: { "@id": WEBSITE_ID }, author: { "@id": PERSON_TA["@id"] } },
      ]}
    />
  );
}

/** One page of notes: lecture material written by the TA, part of the course. */
export function NoteJsonLd({ slug }: { slug: Note["slug"] }) {
  const page = notes.find((item) => item.slug === slug)!;
  return (
    <JsonLd
      graph={[
        noteNode(page),
        ta,
        { "@type": "WebSite", "@id": WEBSITE_ID, name: SITE_NAME, url: SITE_URL },
        { "@type": "Course", "@id": COURSE_ID, name: "Interactive Space", courseCode: "ID412", provider: ORG_DEPARTMENT },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
            { "@type": "ListItem", position: 2, name: page.name, item: `${SITE_URL}${page.path}` },
          ],
        },
      ]}
    />
  );
}

// What search engines and LLMs are told about this site. Nothing here is shown
// on a page. Every sentence repeats text that is already on the site: the index
// page, the section headings of the notes, and Prelim §1 (About TA).

export const SITE_URL = "https://id412.xdlab.net";
export const SITE_NAME = "ID412 Web Workshop 2026";
export const REPO_URL = "https://github.com/jeanyoon-choi/id412-2026";

export const SITE_DESCRIPTION =
  "Lecture notes and experiments of the Web Workshop of Interactive Space (ID412), KAIST Dept. of Industrial Design, Fall 2026. Prof. Yiyun Kang · TA Jeanyoon Choi (XD Lab). Three creative frontend web development sessions: Creative Coding (Canvas, GLSL, Three.js), Cross-Device Interaction (WebSocket), Integrating System (API, Sound, Unreal). KAIST 산업디자인학과 Interactive Space (ID412) 수업의 웹 워크숍 강의 노트. 강이연 교수 · 조교 최정윤.";

const CREDIT = "KAIST ID412 Interactive Space, Web Workshop 2026. TA Jeanyoon Choi (최정윤), XD Lab.";

export type Note = {
  slug: "prelim" | "w1" | "w2" | "w3";
  path: string;
  title: string; // the page's <title>, unchanged
  name: string; // the first lines of the page
  date?: string; // as on the index page
  en: string;
  ko: string;
  description: string;
};

function note(slug: Note["slug"], title: string, name: string, en: string, ko: string, date?: string): Note {
  return {
    slug,
    path: `/lecture-materials/${slug}`,
    title,
    name,
    date,
    en,
    ko,
    description: `${name}: ${en}. ${ko}. ${CREDIT}`,
  };
}

export const notes: Note[] = [
  note(
    "prelim",
    "Prelim · ID412 Web Workshop 2026",
    "Prelim. Before Web 1",
    "Workshop overview, AI agents, installation, tutorial homework",
    "워크숍 개요, AI 에이전트, 설치, 튜토리얼 과제",
  ),
  note(
    "w1",
    "W1 · ID412 Web Workshop 2026",
    "W1. Introduction to Creative Web Dev",
    "Creative Coding (Canvas, GLSL, Three.js), AI agents with VS Code + Claude Code, Next.js, deployment",
    "크리에이티브 코딩 (Canvas, GLSL, Three.js), AI agent, Next.js, 배포",
    "10/26",
  ),
  note(
    "w2",
    "W2 · ID412 Web Workshop 2026",
    "W2. Cross-Device Interaction (WebSocket)",
    "Mobile modality & parametric interface, multi-device interaction, Socket.io, mobile sensors, socket deployment",
    "모바일 모달리티 & 파라메트릭 인터페이스, 멀티 디바이스 인터랙션, Socket.io, 모바일 센서, Socket 배포",
    "11/2",
  ),
  note(
    "w3",
    "W3 · ID412 Web Workshop 2026",
    "W3. Integrating System (API, Sound, Mobile, Unreal)",
    "API, LLM API, sound with Tone.js, Unreal, system & interaction, projection mapping",
    "API, 사운드 (Tone.js), Unreal, 시스템 & 인터랙션, 프로젝션 매핑",
    "11/16",
  ),
];

// The people and organisations, under the ids their own sites already use.
export const PERSON_TA = {
  "@type": "Person",
  "@id": "https://jeanyoon.ch/oi#person",
  name: "Jeanyoon Choi",
  alternateName: "최정윤",
  url: "https://jeanyoon.ch/oi",
  sameAs: ["https://www.xdlab.net/people/jeanyoon-choi"],
};

export const PERSON_PROFESSOR = {
  "@type": "Person",
  "@id": "https://www.xdlab.net/people#yiyun-kang",
  name: "Yiyun Kang",
  alternateName: "강이연",
  url: "https://yiyunkang.com/",
};

export const ORG_XDLAB = {
  "@type": "Organization",
  "@id": "https://www.xdlab.net/#org-xdlab",
  name: "XD Lab (Experience Design Lab)",
  alternateName: ["XD Lab", "KAIST Experience Design Lab", "경험디자인연구실"],
  url: "https://www.xdlab.net/",
};

export const ORG_DEPARTMENT = {
  "@type": "Organization",
  name: "KAIST Department of Industrial Design",
  alternateName: "KAIST 산업디자인학과",
  url: "https://id.kaist.ac.kr/",
  parentOrganization: { "@type": "CollegeOrUniversity", "@id": "https://www.kaist.ac.kr/#org", name: "KAIST" },
};

import Link from "next/link";
import { L } from "@/app/lecture/components/lang/lang-block";

const weeks = [
  {
    href: "/lecture/prelim",
    label: "Prelim",
    en: "Workshop overview, AI agents, installation, tutorial homework",
    ko: "워크숍 개요, AI 에이전트, 설치, 튜토리얼 과제",
  },
  {
    href: "/lecture/w1",
    label: "Web 1 · 10/26",
    en: "Creative Coding (Canvas, GLSL, Three.js)",
    ko: "크리에이티브 코딩 (Canvas, GLSL, Three.js)",
  },
  {
    href: "/lecture/w2",
    label: "Web 2 · 11/9",
    en: "Cross-Device Interaction (WebSocket)",
    ko: "크로스 디바이스 인터랙션 (WebSocket)",
  },
  {
    href: "/lecture/w3",
    label: "Web 3 · 11/16",
    en: "Integrating System (API, Sound, Unreal)",
    ko: "시스템 통합 (API, 사운드, Unreal)",
  },
];

export default function Home() {
  return (
    <>
      <h1>ID412 Interactive Space — Web Workshop</h1>
      <p>
        <L
          en="KAIST Dept. of Industrial Design, Fall 2026. Prof. Yiyun Kang, TA Jeanyoon Choi (XD Lab). Three creative frontend web development sessions. A sub-module of the Interactive Space (ID412) class."
          ko="KAIST 산업디자인학과, 2026년 가을. Yiyun Kang 교수, 조교 최정윤 (XD Lab). 크리에이티브 프론트엔드 웹 개발 세션 세 번. Interactive Space (ID412) 수업 안의 서브 모듈이다."
        />
      </p>
      <ul>
        {weeks.map((week) => (
          <li key={week.href}>
            <Link href={week.href}>{week.label}</Link> — <L en={week.en} ko={week.ko} />
          </li>
        ))}
      </ul>
      <p>
        <L en="Code: " ko="코드: " />
        <a href="https://github.com/jeanyoon-choi/id412-2026" target="_blank" rel="noopener noreferrer">
          github.com/jeanyoon-choi/id412-2026
        </a>{" "}
        <L en="(use as template)." ko="(템플릿으로 사용)." />
      </p>
    </>
  );
}

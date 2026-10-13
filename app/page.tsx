import Link from "next/link";

const weeks = [
  { href: "/lecture/prelim", label: "Prelim", note: "Course overview, installation, tutorial homework" },
  { href: "/lecture/w1", label: "Web 1 · 10/26", note: "Creative Coding (Canvas, GLSL, Three.js)" },
  { href: "/lecture/w2", label: "Web 2 · 11/9", note: "Cross-Device Interaction (WebSocket)" },
  { href: "/lecture/w3", label: "Web 3 · 11/16", note: "Integrating System (API, Sound, Unreal)" },
];

export default function Home() {
  return (
    <>
      <h1>ID412 Interactive Space — Web Workshop</h1>
      <p>
        KAIST Dept. of Industrial Design, Fall 2026. Prof. Yiyun Kang, TA Jeanyoon Choi (XD Lab).
        Three creative frontend web development sessions within the Interactive Space course.
      </p>
      <ul>
        {weeks.map((week) => (
          <li key={week.href}>
            <Link href={week.href}>{week.label}</Link> — {week.note}
          </li>
        ))}
      </ul>
      <p>
        Code: <a href="https://github.com/jeanyoon-choi/id412-2026" target="_blank" rel="noopener noreferrer">github.com/jeanyoon-choi/id412-2026</a> (use as
        template).
      </p>
    </>
  );
}

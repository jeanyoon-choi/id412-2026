import styles from "./stack-diagram.module.css";

// The frontend stack we use, as layers. Bold = what this workshop uses.
// Faded = alternatives students will meet in the wild. Keep it this short.
const layers: { label: { en: string; ko: string }; ours: string[]; others: string[] }[] = [
  { label: { en: "Creative layer", ko: "크리에이티브 레이어" }, ours: ["Canvas", "GLSL", "Three.js", "Web Audio", "Socket.io"], others: ["p5.js", "WebGPU"] },
  { label: { en: "Styling", ko: "스타일링" }, ours: ["CSS Modules"], others: ["Tailwind", "styled-components"] },
  { label: { en: "Meta-framework", ko: "메타 프레임워크" }, ours: ["Next.js"], others: ["Remix", "Astro", "Nuxt"] },
  { label: { en: "UI framework", ko: "UI 프레임워크" }, ours: ["React"], others: ["Vue", "Svelte", "Angular"] },
  { label: { en: "Language", ko: "언어" }, ours: ["TypeScript"], others: [] },
  { label: { en: "Fundamentals", ko: "기초" }, ours: ["HTML", "CSS", "Javascript"], others: [] },
  { label: { en: "Runtime + packages", ko: "런타임 + 패키지" }, ours: ["Node.js", "pnpm"], others: ["npm", "yarn"] },
];

const tools = {
  en: ["VS Code + Claude Code (editor + agent)", "Git + GitHub (versions)", "Vercel (deploy)"],
  ko: ["VS Code + Claude Code (에디터 + 에이전트)", "Git + GitHub (버전 관리)", "Vercel (배포)"],
};

export function StackDiagram() {
  return (
    <figure className={styles.figure}>
      <div className={styles.stack}>
        {layers.map((layer) => (
          <div key={layer.label.en} className={styles.layer}>
            <div className={styles.label}>
              <span data-lang-block="en">{layer.label.en}</span>
              <span data-lang-block="ko">{layer.label.ko}</span>
            </div>
            <div className={styles.cells}>
              {layer.ours.map((name) => (
                <span key={name} className={styles.ours}>
                  {name}
                </span>
              ))}
              {layer.others.map((name) => (
                <span key={name} className={styles.other}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.side}>
        <div className={styles.sideTitle}>
          <span data-lang-block="en">Around it</span>
          <span data-lang-block="ko">그 주변</span>
        </div>
        {(["en", "ko"] as const).map((lang) => (
          <ul key={lang} data-lang-block={lang} className={styles.tools}>
            {tools[lang].map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        ))}
      </div>
      <figcaption className={styles.caption}>
        <span data-lang-block="en">
          Each layer runs on the one below it. <b>Bold</b> is what we use; grey is what you will see elsewhere.
        </span>
        <span data-lang-block="ko">
          각 층은 바로 아래 층 위에서 돈다. <b>굵은 글씨</b>가 우리가 쓰는 것, 회색은 다른 데서 보게 될 것.
        </span>
      </figcaption>
    </figure>
  );
}

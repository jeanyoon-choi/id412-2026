import styles from "./device-diagram.module.css";

// One XD Lab work = its system schematic next to its installation photo.
// The schematics follow the artist's own (jeanyoon.ch/oi): output devices on top,
// the work's system in the middle, the mobile at the bottom.
// Solid arrow: an event sent through Socket.IO. Dashed arrow: an API call, or what is sent back.
type Label = { en: string; ko: string };
type Node = { id: string; label: Label; note?: Label; kind?: "system" | "mobile"; weight?: number };
type Route = { from: string; to: string; label?: Label; dashed?: boolean };
type Work = { title: Label; href: string; photo: string; rows: Node[][]; routes: Route[] };

const same = (text: string): Label => ({ en: text, ko: text });
const each = (ids: string[], route: (id: string) => Route) => ids.map(route);

const WORKS: Record<string, Work> = {
  "banpo-xism": {
    title: { en: "Banpo-Xism (2026): multiple mobiles → 1 media wall + 3 vertical TVs", ko: "반포자이즘 (2026): 여러 대의 모바일 → 미디어월 1 + 세로형 TV 3" },
    href: "https://www.xdlab.net/projects/banpo-xism",
    photo: "/lecture-materials/w2/banpo-xism-installation.webp",
    rows: [
      [
        { id: "tv0", label: same("L-Axis"), note: same("TV · 1D") },
        { id: "tv1", label: same("L-B Plane"), note: same("TV · 2D") },
        { id: "tv2", label: same("B-Axis"), note: same("TV · 1D") },
        { id: "wall", label: { en: "Media Wall", ko: "미디어월" }, note: same("3D"), weight: 1.6 },
      ],
      [
        { id: "price", label: { en: "Price", ko: "가격" }, note: { en: "= position on the L-B plane", ko: "= L-B 평면 위의 위치" }, kind: "system" },
        { id: "field", label: { en: "Apartment Field", ko: "아파트 필드" }, note: { en: "361 apartments", ko: "아파트 361개" }, kind: "system" },
      ],
      [
        { id: "m1", label: same(""), kind: "mobile" },
        { id: "m2", label: { en: "Mobiles", ko: "모바일" }, kind: "mobile" },
        { id: "m3", label: same(""), kind: "mobile" },
      ],
    ],
    routes: [
      ...each(["m1", "m2", "m3"], (id) => ({ from: id, to: "field", label: id === "m3" ? { en: "scroll, touch, tilt, shake, voice", ko: "스크롤, 터치, 기울기, 흔들기, 목소리" } : undefined })),
      { from: "field", to: "wall" },
      { from: "field", to: "price" },
      ...each(["tv0", "tv1", "tv2"], (id) => ({ from: "price", to: id })),
      ...each(["m1", "m2", "m3"], (id) => ({ from: "price", to: id, dashed: true, label: id === "m1" ? { en: "price", ko: "가격" } : undefined })),
    ],
  },
  omega: {
    title: { en: "Ω (2025): 1 mobile → 4 screens", ko: "Ω (2025): 모바일 1 → 스크린 4" },
    href: "https://www.xdlab.net/projects/omega",
    photo: "/lecture-materials/w2/omega-mobile.webp",
    rows: [
      [
        { id: "s0", label: same("E/I Axis"), note: { en: "screen", ko: "스크린" } },
        { id: "s1", label: same("N/S Axis"), note: { en: "screen", ko: "스크린" } },
        { id: "s2", label: same("T/F Axis"), note: { en: "screen", ko: "스크린" } },
        { id: "s3", label: same("P/J Axis"), note: { en: "screen", ko: "스크린" } },
      ],
      [
        { id: "type", label: { en: "Type Analysis", ko: "유형 분석" }, note: same("GPT"), kind: "system" },
        { id: "shake", label: { en: "Shake Counter", ko: "흔들기 카운터" }, kind: "system" },
      ],
      [
        { id: "question", label: { en: "Questionnaire", ko: "질문지" }, note: same("GPT"), kind: "system", weight: 1.6 },
        { id: "mobile", label: { en: "Mobile", ko: "모바일" }, kind: "mobile" },
        { id: "_gap", label: same(""), weight: 1.6 },
      ],
    ],
    routes: [
      { from: "question", to: "mobile", dashed: true },
      { from: "mobile", to: "type", label: { en: "answer", ko: "답" } },
      { from: "mobile", to: "shake", label: { en: "accelerometer, camera", ko: "가속도계, 카메라" } },
      ...each(["s0", "s1", "s2", "s3"], (id) => ({ from: "type", to: id })),
      ...each(["s0", "s1", "s2", "s3"], (id) => ({ from: "shake", to: id })),
    ],
  },
  sota: {
    title: { en: "SoTA (2024): 1 mobile → 2 projections + 4 screens", ko: "SoTA (2024): 모바일 1 → 프로젝션 2 + 스크린 4" },
    href: "https://www.xdlab.net/projects/sota",
    photo: "/lecture-materials/w2/sota-installation.webp",
    rows: [
      [
        { id: "proj1", label: { en: "Projection", ko: "프로젝션" }, note: same("3D"), weight: 1.3 },
        { id: "pc0", label: same("Dashboard") },
        { id: "pc1", label: same("Avatar") },
        { id: "pc2", label: same("Wireframe") },
        { id: "pc3", label: same("Map") },
        { id: "proj2", label: { en: "Projection", ko: "프로젝션" }, note: same("3D"), weight: 1.3 },
      ],
      [
        { id: "tts", label: same("Azure TTS"), note: { en: "speech", ko: "음성" }, kind: "system" },
        { id: "server", label: { en: "Server", ko: "서버" }, note: same("Socket.IO"), kind: "system", weight: 1.4 },
        { id: "openai", label: same("GPT-4o"), note: same("Embeddings API"), kind: "system" },
      ],
      [{ id: "mobile", label: { en: "Mobile", ko: "모바일" }, kind: "mobile" }],
    ],
    routes: [
      { from: "mobile", to: "server", label: { en: "select model, orientation, heartbeat", ko: "모델 선택, 기기 방향, 하트비트" } },
      ...each(["proj1", "pc0", "pc1", "pc2", "pc3", "proj2"], (id) => ({ from: "server", to: id })),
      { from: "pc1", to: "tts", dashed: true },
      ...each(["pc0", "pc1", "pc2", "pc3"], (id) => ({ from: id, to: "openai", dashed: true })),
    ],
  },
};

const WIDTH = 460;
const ROW = 104; // distance between rows
const BOX = 44; // box height
const TOP = 10;

type Placed = Node & { x: number; y: number; width: number };

// Give every node of every row a position: rows top to bottom, nodes side by side by weight.
function place(rows: Node[][]) {
  const placed: Record<string, Placed> = {};
  rows.forEach((row, rowIndex) => {
    const total = row.reduce((sum, node) => sum + (node.weight ?? 1), 0);
    let left = 0;
    for (const node of row) {
      const slot = (WIDTH * (node.weight ?? 1)) / total;
      const width = node.kind === "mobile" ? Math.min(slot - 10, 62) : slot - 10;
      placed[node.id] = { ...node, x: left + slot / 2, y: TOP + rowIndex * ROW, width };
      left += slot;
    }
  });
  return placed;
}

function Text({ label, ...props }: { label: Label } & React.SVGProps<SVGTextElement>) {
  return (
    <>
      <text data-lang-block="en" {...props}>
        {label.en}
      </text>
      <text data-lang-block="ko" {...props}>
        {label.ko}
      </text>
    </>
  );
}

function Arrow({ from, to, route }: { from: Placed; to: Placed; route: Route }) {
  // Leave from the side facing the other node: top / bottom between rows, left / right inside a row.
  let start: [number, number];
  let end: [number, number];
  if (from.y === to.y) {
    const direction = to.x > from.x ? 1 : -1;
    start = [from.x + (direction * from.width) / 2, from.y + BOX / 2];
    end = [to.x - (direction * to.width) / 2, to.y + BOX / 2];
  } else if (from.y > to.y) {
    start = [from.x, from.y];
    end = [to.x, to.y + BOX];
  } else {
    start = [from.x, from.y + BOX];
    end = [to.x, to.y];
  }
  const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
  const tipX = end[0] - ((end[0] - start[0]) / length) * 7; // stop short: the arrow head fills the gap
  const tipY = end[1] - ((end[1] - start[1]) / length) * 7;
  return (
    <>
      <line x1={start[0]} y1={start[1]} x2={tipX} y2={tipY} className={route.dashed ? `${styles.line} ${styles.dashed}` : styles.line} markerEnd="url(#device-arrow)" />
      {route.label && <Text label={route.label} x={(start[0] + end[0]) / 2} y={(start[1] + end[1]) / 2 - 5} textAnchor="middle" className={styles.label} />}
    </>
  );
}

export function DeviceDiagram({ work }: { work: keyof typeof WORKS }) {
  const { title, href, photo, rows, routes } = WORKS[work];
  const nodes = place(rows);
  const height = TOP * 2 + (rows.length - 1) * ROW + BOX;

  return (
    <figure className={styles.figure}>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className={styles.svg} role="img" aria-label={`${title.en}, system schematic`}>
        <defs>
          <marker id="device-arrow" viewBox="0 0 8 8" refX="1" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 z" className={styles.head} />
          </marker>
        </defs>

        {routes.map((route) => (
          <Arrow key={`${route.from}-${route.to}`} from={nodes[route.from]} to={nodes[route.to]} route={route} />
        ))}

        {Object.values(nodes)
          .filter((node) => !node.id.startsWith("_")) // "_gap" only takes up space
          .map((node) => (
            <g key={node.id}>
              <rect
                x={node.x - node.width / 2}
                y={node.y}
                width={node.width}
                height={BOX}
                rx={node.kind === "mobile" ? 8 : 0}
                className={node.kind === "system" ? `${styles.box} ${styles.system}` : styles.box}
              />
              <Text label={node.label} x={node.x} y={node.y + (node.note ? 19 : 26)} textAnchor="middle" className={styles.title} />
              {node.note && <Text label={node.note} x={node.x} y={node.y + 33} textAnchor="middle" className={styles.note} />}
            </g>
          ))}
      </svg>

      <a href={href} target="_blank" rel="noopener noreferrer" className={styles.photo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={`${title.en}, installation view`} />
      </a>

      <figcaption className={styles.caption}>
        <span data-lang-block="en">{title.en}. Solid: Socket.IO event. Dashed: API call / sent back.</span>
        <span data-lang-block="ko">{title.ko}. 실선: Socket.IO 이벤트. 점선: API 호출 / 되돌아가는 것.</span>
      </figcaption>
    </figure>
  );
}

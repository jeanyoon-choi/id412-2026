import styles from "./parameter-diagram.module.css";

// The "visual instrument" as a patch diagram: mobile inputs → parameters → laptop outputs.
// Solid line = continuous, dashed = discrete. One example mapping, not a rule.
type Label = { en: string; ko: string };
type Node = { id: string; label: Label; note: Label };

const inputs: Node[] = [
  { id: "x", label: { en: "touch x", ko: "터치 x" }, note: { en: "continuous", ko: "연속" } },
  { id: "y", label: { en: "touch y", ko: "터치 y" }, note: { en: "continuous", ko: "연속" } },
  { id: "tilt", label: { en: "tilt", ko: "기울기" }, note: { en: "continuous", ko: "연속" } },
  { id: "tap", label: { en: "tap", ko: "탭" }, note: { en: "discrete", ko: "불연속" } },
];

const parameters: Node[] = [
  { id: "hue", label: { en: "hue", ko: "hue" }, note: { en: "0 – 360", ko: "0 – 360" } },
  { id: "size", label: { en: "size", ko: "size" }, note: { en: "0 – 1", ko: "0 – 1" } },
  { id: "speed", label: { en: "speed", ko: "speed" }, note: { en: "0 – 1", ko: "0 – 1" } },
  { id: "mode", label: { en: "mode", ko: "mode" }, note: { en: "1, 2, 3", ko: "1, 2, 3" } },
];

const outputs: Node[] = [
  { id: "colour", label: { en: "colour", ko: "색" }, note: { en: "visual", ko: "비주얼" } },
  { id: "shape", label: { en: "shape size", ko: "도형 크기" }, note: { en: "visual", ko: "비주얼" } },
  { id: "pitch", label: { en: "pitch", ko: "음높이" }, note: { en: "sound", ko: "사운드" } },
  { id: "motion", label: { en: "motion", ko: "움직임" }, note: { en: "visual", ko: "비주얼" } },
  { id: "scene", label: { en: "scene", ko: "장면" }, note: { en: "visual + sound", ko: "비주얼 + 사운드" } },
];

// [from, to, how the value is converted, discrete?]
const conversions: [string, string, string, boolean][] = [
  ["x", "hue", "x ÷ width × 360", false],
  ["y", "size", "y ÷ height", false],
  ["tilt", "speed", "angle ÷ 90°", false],
  ["tap", "mode", "count", true],
];

const rules: [string, string, boolean][] = [
  ["hue", "colour", false],
  ["size", "shape", false],
  ["size", "pitch", false],
  ["speed", "motion", false],
  ["mode", "scene", true],
];

const WIDTH = 900;
const BOX = { width: 170, height: 40 };
const COLUMN = { input: 10, parameter: 365, output: 720 };
const TOP = 62;
const HEIGHT = 300;

// Vertical centre of row `index` when `count` rows share the height.
const rowY = (index: number, count: number) => TOP + ((HEIGHT - TOP - 10) / count) * (index + 0.5);

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

function Column({ nodes, x, strong }: { nodes: Node[]; x: number; strong?: boolean }) {
  return (
    <>
      {nodes.map((node, index) => {
        const y = rowY(index, nodes.length);
        return (
          <g key={node.id}>
            <rect
              x={x}
              y={y - BOX.height / 2}
              width={BOX.width}
              height={BOX.height}
              className={strong ? `${styles.box} ${styles.strong}` : styles.box}
            />
            <Text label={node.label} x={x + 12} y={y + 5} className={styles.name} />
            <Text label={node.note} x={x + BOX.width - 12} y={y + 4} textAnchor="end" className={styles.note} />
          </g>
        );
      })}
    </>
  );
}

function Link({ x1, y1, x2, y2, dashed, label }: { x1: number; y1: number; x2: number; y2: number; dashed: boolean; label?: string }) {
  const middle = (x1 + x2) / 2;
  return (
    <>
      <path
        d={`M ${x1} ${y1} C ${middle} ${y1}, ${middle} ${y2}, ${x2 - 7} ${y2}`}
        className={dashed ? `${styles.link} ${styles.dashed}` : styles.link}
        markerEnd="url(#parameter-arrow)"
      />
      {label && (
        <text x={middle} y={(y1 + y2) / 2 - 7} textAnchor="middle" className={styles.convert}>
          {label}
        </text>
      )}
    </>
  );
}

const y = (nodes: Node[], id: string) =>
  rowY(
    nodes.findIndex((node) => node.id === id),
    nodes.length,
  );

export function ParameterDiagram() {
  return (
    <figure className={styles.figure}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.svg} role="img" aria-label="Inputs, parameters and outputs of a visual instrument">
        <defs>
          <marker id="parameter-arrow" viewBox="0 0 8 8" refX="1" refY="4" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M 0 0 L 8 4 L 0 8 z" className={styles.head} />
          </marker>
        </defs>

        <Text label={{ en: "1 · INPUT (mobile)", ko: "1 · 입력 (모바일)" }} x={COLUMN.input} y={20} className={styles.heading} />
        <Text label={{ en: "2 · PARAMETER", ko: "2 · 파라미터" }} x={COLUMN.parameter} y={20} className={styles.heading} />
        <Text label={{ en: "3 · OUTPUT (laptop)", ko: "3 · 출력 (노트북)" }} x={COLUMN.output} y={20} className={styles.heading} />
        <Text
          label={{ en: "conversion", ko: "변환" }}
          x={(COLUMN.input + BOX.width + COLUMN.parameter) / 2}
          y={42}
          textAnchor="middle"
          className={styles.stage}
        />
        <Text
          label={{ en: "system rules", ko: "시스템 규칙" }}
          x={(COLUMN.parameter + BOX.width + COLUMN.output) / 2}
          y={42}
          textAnchor="middle"
          className={styles.stage}
        />

        {conversions.map(([from, to, label, dashed]) => (
          <Link
            key={from + to}
            x1={COLUMN.input + BOX.width}
            y1={y(inputs, from)}
            x2={COLUMN.parameter}
            y2={y(parameters, to)}
            dashed={dashed}
            label={label}
          />
        ))}
        {rules.map(([from, to, dashed]) => (
          <Link
            key={from + to}
            x1={COLUMN.parameter + BOX.width}
            y1={y(parameters, from)}
            x2={COLUMN.output}
            y2={y(outputs, to)}
            dashed={dashed}
          />
        ))}

        <Column nodes={inputs} x={COLUMN.input} />
        <Column nodes={parameters} x={COLUMN.parameter} strong />
        <Column nodes={outputs} x={COLUMN.output} />
      </svg>
      <figcaption className={styles.caption}>
        <span data-lang-block="en">Solid line: continuous. Dashed line: discrete. One parameter can drive several outputs.</span>
        <span data-lang-block="ko">실선: 연속. 점선: 불연속. 파라미터 하나가 출력 여러 개를 움직일 수 있다.</span>
      </figcaption>
    </figure>
  );
}

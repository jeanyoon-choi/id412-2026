import { L } from "../lang/lang-block";
import styles from "./device-diagram.module.css";

// One XD Lab work: a short muted clip of it, and how it works.
// Read like the Socket.io diagrams of §3: the mobile on the left, the screens on the right.
// One row = one thing the visitor does: on the mobile → what the system does with it → what changes on the screens.
// A row marked `back` runs the other way: the system → the mobile.
// Sources: the artist's own schematics and texts (jeanyoon.ch/oi/artworks).
type Label = { en: string; ko: string };
type Flow = { mobile: Label; sends: Label; system: Label; screens?: Label; back?: boolean };
type Work = { title: string; year: number; href: string; clip: string; devices: Label; about: Label; outputs: Label; flows: Flow[] };

const WORKS: Record<string, Work> = {
  "banpo-xism": {
    title: "Banpo-Xism",
    year: 2026,
    href: "https://jeanyoon.ch/oi/artworks/banpo-xism",
    clip: "/lecture-materials/w2/banpo-xism-loop",
    devices: { en: "multiple mobiles → 1 media wall + 3 vertical TVs", ko: "여러 대의 모바일 → 미디어월 1 + 세로형 TV 3" },
    about: {
      en: "361 fictional apartments on a grid: location (L) × brand (B). An apartment's position on the grid is its price.",
      ko: "가상의 아파트 361개가 입지(L)와 브랜드(B)를 두 축으로 하는 격자 위에 놓여 있다. 격자에서의 위치가 곧 가격이다.",
    },
    outputs: { en: "Media wall + 3 TVs", ko: "미디어월 + TV 3" },
    flows: [
      {
        mobile: { en: "Scroll the apartment feed", ko: "아파트 피드를 스크롤한다" },
        sends: { en: "scroll", ko: "스크롤" },
        system: { en: "The visitor's position climbs the grid, toward the most expensive apartment", ko: "관객의 위치가 격자에서 가장 비싼 아파트 쪽으로 올라간다" },
        screens: { en: "Every visitor's position, at the same time", ko: "모든 관객의 위치를 한꺼번에 보여준다" },
      },
      {
        mobile: { en: "Touch, tilt, shake, shout", ko: "터치, 기울이기, 흔들기, 소리치기" },
        sends: { en: "gesture", ko: "제스처" },
        system: { en: "The flat grid of apartments bends: it rolls into a torus, then turns in higher dimensions", ko: "평평하던 아파트 격자가 토러스 모양으로 말리고, 더 높은 차원에서 회전하며 휜다" },
        screens: { en: "Media wall: the bent grid in 3D. TVs: its flat shadows (L axis, L-B plane, B axis)", ko: "미디어월은 휜 격자를 3D로 보여주고, TV 세 대는 그 격자를 평면에 비춘 모습(L축, L-B 평면, B축)을 보여준다" },
      },
      {
        back: true,
        mobile: { en: "Each mobile shows the new price of its apartment", ko: "모바일마다 자기 아파트의 바뀐 가격이 뜬다" },
        sends: { en: "price", ko: "가격" },
        system: { en: "Every apartment gets a new price from its new position", ko: "아파트마다 바뀐 위치에 따라 가격이 다시 매겨진다" },
      },
    ],
  },
  omega: {
    title: "Ω",
    year: 2025,
    href: "https://jeanyoon.ch/oi/artworks/omega",
    clip: "/lecture-materials/w2/omega-screens-loop",
    devices: { en: "1 mobile → 4 screens", ko: "모바일 1 → 스크린 4" },
    about: {
      en: "A personality test. Each of the four screens is one MBTI axis: E/I, N/S, T/F, P/J.",
      ko: "성격 검사를 다룬 작품이다. 스크린 네 개가 MBTI의 네 축(E/I, N/S, T/F, P/J)을 하나씩 맡는다.",
    },
    outputs: { en: "4 screens", ko: "스크린 4" },
    flows: [
      {
        mobile: { en: "Answer a two-choice question", ko: "양자택일 질문에 답한다" },
        sends: { en: "answer", ko: "답" },
        system: { en: "GPT reads the answers and gives one weight per axis", ko: "GPT가 답을 분석해서 축마다 가중치를 매긴다" },
        screens: { en: "One screen takes its new letter and colour; the four take turns", ko: "스크린 하나의 글자와 색이 바뀐다. 답할 때마다 네 스크린이 차례로 바뀐다" },
      },
      {
        back: true,
        mobile: { en: "The next question appears", ko: "다음 질문이 뜬다" },
        sends: { en: "question", ko: "질문" },
        system: { en: "GPT writes one question at a time", ko: "GPT가 질문을 하나씩 만들어 보낸다" },
      },
      {
        mobile: { en: "Shake the mobile; its camera takes a photo", ko: "모바일을 흔들면 카메라가 사진을 찍는다" },
        sends: { en: "shake, photo", ko: "흔들기, 사진" },
        system: { en: "Each shake is counted (up to 35, then the work ends)", ko: "흔든 횟수를 센다 (35번이 되면 작품이 끝난다)" },
        screens: { en: "All four distort at once; the photo enters them", ko: "스크린 네 개가 한꺼번에 일그러지고, 찍힌 사진이 화면 속에 들어간다" },
      },
    ],
  },
  sota: {
    title: "SoTA",
    year: 2024,
    href: "https://jeanyoon.ch/oi/artworks/sota",
    clip: "/lecture-materials/w2/sota-loop",
    devices: { en: "1 mobile → 2 projections + 4 screens", ko: "모바일 1 → 프로젝션 2 + 스크린 4" },
    about: {
      en: "An exhibition of AI models. Four screens (dashboard, AI avatar docent, wireframe, map) between two projections.",
      ko: "AI 모델을 전시하는 작품이다. 프로젝션 두 개 사이에 스크린 네 개(대시보드, AI 아바타 도슨트, 와이어프레임, 지도)가 놓여 있다.",
    },
    outputs: { en: "2 projections + 4 screens", ko: "프로젝션 2 + 스크린 4" },
    flows: [
      {
        mobile: { en: "Select an AI model", ko: "AI 모델을 고른다" },
        sends: { en: "model", ko: "모델" },
        system: { en: "The server sends the choice to every device", ko: "서버가 고른 모델을 모든 기기에 알린다" },
        screens: { en: "All six show that model", ko: "여섯 화면 모두 그 모델을 보여준다" },
      },
      {
        mobile: { en: "Tilt the mobile", ko: "모바일을 기울인다" },
        sends: { en: "orientation", ko: "기기 방향" },
        system: { en: "The server passes it on, continuously", ko: "서버가 기울기 값을 계속 전달한다" },
        screens: { en: "The projections and the avatar turn with it", ko: "프로젝션과 아바타가 기울기를 따라 회전한다" },
      },
      {
        mobile: { en: "Lock or close the mobile", ko: "모바일을 잠그거나 닫는다" },
        sends: { en: "heartbeat stops", ko: "하트비트 끊김" },
        system: { en: "No sign of the mobile for 4 seconds: the visitor has left", ko: "모바일의 신호가 4초 동안 끊기면 관객이 떠난 것으로 본다" },
        screens: { en: "Blue screens, one after another. Then the screens talk to GPT-4o and to each other, without a visitor", ko: "화면이 하나씩 블루스크린으로 바뀐다. 그 뒤에는 관객 없이 스크린들이 GPT-4o와, 그리고 서로 대화를 이어간다" },
      },
    ],
  },
};

function Arrow({ label, back }: { label?: Label; back?: boolean }) {
  return (
    <div className={back ? `${styles.arrow} ${styles.back}` : styles.arrow}>
      {label && <L en={label.en} ko={label.ko} />}
      <i aria-hidden="true" />
    </div>
  );
}

export function DeviceDiagram({ work }: { work: keyof typeof WORKS }) {
  const { title, year, href, clip, devices, about, outputs, flows } = WORKS[work];
  return (
    <figure className={styles.figure}>
      <figcaption className={styles.heading}>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {title} ({year})
        </a>
        <span>
          <L en={devices.en} ko={devices.ko} />
        </span>
      </figcaption>

      <div className={styles.body}>
        <a href={href} target="_blank" rel="noopener noreferrer" className={styles.photo}>
          {/* A loop cut from the work's documentation video (jeanyoon.ch/oi) */}
          <video src={`${clip}.mp4`} poster={`${clip}.webp`} autoPlay loop muted playsInline aria-label={`${title}, documentation clip`} />
          <span>
            <L en={about.en} ko={about.ko} />
          </span>
        </a>

        <div className={styles.flows}>
          {/* The three columns: the same order as in §3 */}
          <div className={styles.column}>
            <L en="Mobile · input" ko="모바일 · 입력" />
          </div>
          <div />
          <div className={styles.column}>
            <L en="System" ko="시스템" />
          </div>
          <div />
          <div className={styles.column}>
            <L en={`${outputs.en} · output`} ko={`${outputs.ko} · 출력`} />
          </div>

          {flows.map((flow, index) => (
            <div key={index} className={styles.flow}>
              <div className={`${styles.cell} ${styles.mobile}`}>
                <L en={flow.mobile.en} ko={flow.mobile.ko} />
              </div>
              <Arrow label={flow.sends} back={flow.back} />
              <div className={`${styles.cell} ${styles.system}`}>
                <L en={flow.system.en} ko={flow.system.ko} />
              </div>
              {flow.screens ? (
                <>
                  <Arrow />
                  <div className={styles.cell}>
                    <L en={flow.screens.en} ko={flow.screens.ko} />
                  </div>
                </>
              ) : (
                <>
                  <div />
                  <div />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}

import { L } from "../lang/lang-block";
import styles from "./socket-diagram.module.css";

// The W2 relay as a sequence diagram: three columns (mobile, relay, screen), time runs downward.
// An arrow is one message, from the sender to the receiver. The numbers are the five steps of
// "Overall workflow" in the notes. The example is the `drawing` experiment (room "drawing", type "move").
type Label = { en: string; ko: string };

const WIDTH = 900;
const HEIGHT = 520;
const X = { mobile: 130, relay: 450, screen: 770 }; // the three lifelines
type Column = keyof typeof X;

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

function Header({ at, role, title, file, strong }: { at: Column; role: Label; title: Label; file: string; strong?: boolean }) {
  return (
    <>
      <rect className={strong ? `${styles.box} ${styles.strong}` : styles.box} x={X[at] - 120} y={8} width={240} height={66} />
      <Text label={role} className={styles.role} x={X[at]} y={27} textAnchor="middle" />
      <Text label={title} className={styles.title} x={X[at]} y={47} textAnchor="middle" />
      <text className={styles.file} x={X[at]} y={64} textAnchor="middle">
        {file}
      </text>
    </>
  );
}

// A phase: a band across the diagram that says when the arrows below it happen.
function Phase({ y, label }: { y: number; label: Label }) {
  return (
    <>
      <rect className={styles.band} x={0} y={y} width={WIDTH} height={24} />
      <Text label={label} className={styles.phase} x={14} y={y + 16} />
    </>
  );
}

// One message: a numbered arrow from one lifeline to another, the code above it, what it does below.
function Message({ y, from, to, step, code, note, dashed }: { y: number; from: Column; to: Column; step?: number; code: string; note?: Label; dashed?: boolean }) {
  const direction = X[to] > X[from] ? 1 : -1;
  const start = X[from] + direction * (step ? 24 : 2); // after the number
  const end = X[to] - direction * 2;
  const middle = (X[from] + X[to]) / 2;
  return (
    <>
      {step && (
        <>
          <circle className={styles.step} cx={X[from] + direction * 12} cy={y} r={11} />
          <text className={styles.stepNumber} x={X[from] + direction * 12} y={y + 4} textAnchor="middle">
            {step}
          </text>
        </>
      )}
      <line className={dashed ? `${styles.arrow} ${styles.dashed}` : styles.arrow} x1={start} y1={y} x2={end - direction * 8} y2={y} />
      <polygon className={styles.head} points={`${end},${y} ${end - direction * 11},${y - 5} ${end - direction * 11},${y + 5}`} />
      <text className={styles.code} x={middle} y={y - 9} textAnchor="middle">
        {code}
      </text>
      {note && <Text label={note} className={styles.note} x={middle} y={y + 18} textAnchor="middle" />}
    </>
  );
}

// What runs where: two servers on the laptop, one port each, and what each one exchanges with the two browsers.
function Server({ y, port, title, does, strong }: { y: number; port: string; title: string; does: Label; strong?: boolean }) {
  return (
    <>
      <rect className={strong ? `${styles.box} ${styles.strong}` : styles.box} x={345} y={y} width={210} height={92} />
      <text className={styles.port} x={450} y={y + 40} textAnchor="middle">
        {port}
      </text>
      <text className={styles.title} x={450} y={y + 62} textAnchor="middle">
        {title}
      </text>
      <Text label={does} className={styles.note} x={450} y={y + 80} textAnchor="middle" />
    </>
  );
}

function Browser({ x, role, title, address, path }: { x: number; role: Label; title: Label; address: string; path: string }) {
  return (
    <>
      <rect className={styles.box} x={x} y={52} width={200} height={206} />
      <Text label={role} className={styles.role} x={x + 100} y={128} textAnchor="middle" />
      <Text label={title} className={styles.title} x={x + 100} y={150} textAnchor="middle" />
      <text className={styles.file} x={x + 100} y={172} textAnchor="middle">
        {address}
      </text>
      <text className={styles.file} x={x + 100} y={187} textAnchor="middle">
        {path}
      </text>
    </>
  );
}

// An arrow between a server (inner end) and a browser (outer end). both = a head at each end.
function Link({ y, side, label, note, both }: { y: number; side: "left" | "right"; label: Label; note: Label; both?: boolean }) {
  const server = side === "left" ? 345 : 555;
  const browser = side === "left" ? 210 : 690;
  const out = side === "left" ? -1 : 1; // direction from the server to the browser
  const middle = (server + browser) / 2;
  return (
    <>
      <line className={styles.arrow} x1={server + out * (both ? 12 : 2)} y1={y} x2={browser - out * 12} y2={y} />
      <polygon className={styles.head} points={`${browser - out * 2},${y} ${browser - out * 13},${y - 5} ${browser - out * 13},${y + 5}`} />
      {both && <polygon className={styles.head} points={`${server + out * 2},${y} ${server + out * 13},${y - 5} ${server + out * 13},${y + 5}`} />}
      <Text label={label} className={styles.linkLabel} x={middle} y={y - 9} textAnchor="middle" />
      <Text label={note} className={styles.note} x={middle} y={y + 18} textAnchor="middle" />
    </>
  );
}

function PortsDiagram() {
  return (
    <figure className={styles.figure}>
      <svg className={styles.svg} viewBox="0 0 900 290" role="img" aria-label="The laptop runs two servers: Next.js on port 3000 gives the pages, the relay on port 4000 passes the messages">
        {/* The laptop, running both servers */}
        <rect className={styles.machine} x={325} y={8} width={250} height={274} />
        <Text label={{ en: "YOUR LAPTOP · pnpm dev", ko: "내 노트북 · pnpm dev" }} className={styles.role} x={450} y={28} textAnchor="middle" />
        <Server y={44} port=":3000" title="Next.js" does={{ en: "gives each browser its page", ko: "브라우저에 페이지를 보내준다" }} />
        <Server y={170} port=":4000" title="socket-server.mjs" does={{ en: "the relay: passes the messages", ko: "relay 서버: 메시지를 전달한다" }} strong />

        <Browser x={10} role={{ en: "CLIENT A · INPUT", ko: "클라이언트 A · 입력" }} title={{ en: "Mobile browser", ko: "모바일 브라우저" }} address="http://<IP>:3000" path="/…/mobile" />
        <Browser x={690} role={{ en: "CLIENT B · OUTPUT", ko: "클라이언트 B · 출력" }} title={{ en: "Laptop browser", ko: "노트북 브라우저" }} address="http://localhost:3000" path="/…/screen" />

        {/* Port 3000: the page, one way, once. Port 4000: messages, both ways, all the time. */}
        <Link y={90} side="left" label={{ en: "the page", ko: "페이지" }} note={{ en: "once", ko: "한 번" }} />
        <Link y={90} side="right" label={{ en: "the page", ko: "페이지" }} note={{ en: "once", ko: "한 번" }} />
        <Link y={216} side="left" label={{ en: "messages", ko: "메시지" }} note={{ en: "stays connected", ko: "계속 연결" }} both />
        <Link y={216} side="right" label={{ en: "messages", ko: "메시지" }} note={{ en: "stays connected", ko: "계속 연결" }} both />
      </svg>
      <figcaption className={styles.caption}>
        <L
          en="One laptop, two servers, one port each. Port 3000: Next.js gives the page. Port 4000: the relay; the page connects to it and messages go both ways."
          ko="노트북 한 대에서 서버 두 개가 돌고, 서버마다 포트가 하나씩 있다. 3000 포트의 Next.js는 브라우저에 페이지를 보내준다. 4000 포트의 relay 서버는 페이지와 연결을 유지하면서 메시지를 양쪽으로 전달한다."
        />
      </figcaption>
    </figure>
  );
}

export function SocketDiagram() {
  return (
    <>
      <PortsDiagram />
      <SequenceDiagram />
    </>
  );
}

// The same picture after deployment (W2 §7): the two servers are no longer on the laptop.
// Each one runs on its own service on the internet, with its own address.
export function DeployDiagram() {
  return (
    <figure className={styles.figure}>
      <svg className={styles.svg} viewBox="0 0 900 290" role="img" aria-label="After deployment: the Next.js app runs on Vercel, the relay on Render or Railway">
        <Text label={{ en: "ON THE INTERNET", ko: "인터넷 위" }} className={styles.role} x={450} y={28} textAnchor="middle" />
        <Server y={44} port="Vercel" title="Next.js" does={{ en: "your-app.vercel.app", ko: "your-app.vercel.app" }} />
        <Server y={170} port="Render" title="socket-server.mjs" does={{ en: "your-relay.onrender.com", ko: "your-relay.onrender.com" }} strong />
        {/* The one setting that connects them */}
        <line className={`${styles.arrow} ${styles.dashed}`} x1={450} y1={138} x2={450} y2={160} />
        <polygon className={styles.head} points="450,170 445,159 455,159" />

        <Browser x={10} role={{ en: "CLIENT A · INPUT", ko: "클라이언트 A · 입력" }} title={{ en: "Mobile browser", ko: "모바일 브라우저" }} address="your-app.vercel.app" path="/…/mobile" />
        <Browser x={690} role={{ en: "CLIENT B · OUTPUT", ko: "클라이언트 B · 출력" }} title={{ en: "Laptop browser", ko: "노트북 브라우저" }} address="your-app.vercel.app" path="/…/screen" />

        <Link y={90} side="left" label={{ en: "the page", ko: "페이지" }} note={{ en: "once", ko: "한 번" }} />
        <Link y={90} side="right" label={{ en: "the page", ko: "페이지" }} note={{ en: "once", ko: "한 번" }} />
        <Link y={216} side="left" label={{ en: "messages", ko: "메시지" }} note={{ en: "stays connected", ko: "계속 연결" }} both />
        <Link y={216} side="right" label={{ en: "messages", ko: "메시지" }} note={{ en: "stays connected", ko: "계속 연결" }} both />
      </svg>
      <figcaption className={styles.caption}>
        <L
          en={
            <>
              The same two servers as in <a href="#3-socketio">§3</a>, each on its own service. The dotted arrow is the one setting you add: the app on Vercel is told the relay&apos;s address.
            </>
          }
          ko={
            <>
              <a href="#3-socketio">§3</a>에서 본 서버 두 개가 이제 서로 다른 서비스에서 돌아간다. 점선 화살표는 직접 추가해야 하는 설정이다. Vercel에 올린 앱에 relay 서버의 주소를 알려준다.
            </>
          }
        />
      </figcaption>
    </figure>
  );
}

function SequenceDiagram() {
  return (
    <figure className={styles.figure}>
      <svg className={styles.svg} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Mobile, relay server and screen: who sends what to whom, in order">
        {/* The three lifelines */}
        {(Object.keys(X) as Column[]).map((column) => (
          <line key={column} className={styles.lifeline} x1={X[column]} y1={74} x2={X[column]} y2={HEIGHT} />
        ))}
        <Header at="mobile" role={{ en: "CLIENT A · INPUT", ko: "클라이언트 A · 입력" }} title={{ en: "Mobile", ko: "모바일" }} file="mobile/page.tsx" />
        <Header at="relay" role={{ en: "RELAY SERVER · PORT 4000", ko: "RELAY 서버 · 4000 포트" }} title={{ en: "socket-server.mjs", ko: "socket-server.mjs" }} file={'room "drawing"'} strong />
        <Header at="screen" role={{ en: "CLIENT B · OUTPUT", ko: "클라이언트 B · 출력" }} title={{ en: "Laptop screen", ko: "노트북 스크린" }} file="screen/page.tsx" />

        <Phase y={92} label={{ en: "Once, when each page opens", ko: "페이지를 열 때 한 번" }} />
        <Message y={150} from="screen" to="relay" step={1} code={'useSocket("drawing", onMessage)'} note={{ en: "joins the room", ko: "room에 들어간다" }} />
        <Message y={206} from="mobile" to="relay" step={2} code={'useSocket("drawing")'} note={{ en: "joins the room", ko: "room에 들어간다" }} />

        <Phase y={240} label={{ en: "Every time the finger moves", ko: "손가락이 움직일 때마다" }} />
        <Message y={298} from="mobile" to="relay" step={3} code={'send("move", { x, y })'} note={{ en: "sends a message", ko: "메시지를 보낸다" }} />
        <Message y={354} from="relay" to="screen" step={4} code={'{ type: "move", data: { x, y } }'} note={{ en: "forwards it to the rest of the room", ko: "같은 room의 다른 기기에 전달한다" }} />
        {/* Step 5 happens inside the screen page: no arrow */}
        <rect className={styles.box} x={X.screen - 126} y={386} width={252} height={46} />
        <circle className={styles.step} cx={X.screen - 108} cy={409} r={11} />
        <text className={styles.stepNumber} x={X.screen - 108} y={413} textAnchor="middle">
          5
        </text>
        <text className={styles.code} x={X.screen + 16} y={405} textAnchor="middle">
          {'onMessage("move", { x, y })'}
        </text>
        <Text label={{ en: "update the state, draw", ko: "상태를 바꾸고 화면에 그린다" }} className={styles.note} x={X.screen + 16} y={422} textAnchor="middle" />

        <Phase y={448} label={{ en: "The other way works the same (screen → mobile)", ko: "반대 방향(스크린 → 모바일)도 같은 방식이다" }} />
        <Message y={500} from="screen" to="relay" code={"send(…)"} dashed />
        <Message y={500} from="relay" to="mobile" code={"onMessage(…)"} dashed />
      </svg>
      <figcaption className={styles.caption}>
        <L
          en="Port 4000, in order: read from top to bottom. One arrow = one message, from the sender to the receiver. The two devices never talk to each other directly: every message goes through the relay."
          ko="4000 포트에서 일어나는 일을 순서대로 그린 그림이다. 위에서 아래로 읽으면 된다. 화살표 하나가 메시지 하나이고, 보내는 쪽에서 받는 쪽을 향한다. 두 기기는 서로 직접 통신하지 않고, 모든 메시지가 relay 서버를 거친다."
        />
      </figcaption>
    </figure>
  );
}

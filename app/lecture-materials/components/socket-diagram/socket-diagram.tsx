import { L } from "../lang/lang-block";
import styles from "./socket-diagram.module.css";

// The W2 relay in one picture: mobile → relay → screen. The numbers are the
// same five steps as "Overall workflow" in the notes. The example is the
// `drawing` experiment (room "drawing", message type "move").

function Step({ n }: { n: number }) {
  return <span className={styles.step}>{n}</span>;
}

function Wire({ n, en, ko }: { n: number; en: string; ko: string }) {
  return (
    <div className={styles.wire}>
      <div className={styles.wireLabel}>
        <Step n={n} /> <L en={en} ko={ko} />
      </div>
      <div className={styles.arrow} aria-hidden="true">
        <span className={styles.line} />
        <span className={styles.head}>▶</span>
      </div>
      <code className={styles.payload}>{'"move", { x, y }'}</code>
    </div>
  );
}

export function SocketDiagram() {
  return (
    <figure className={styles.figure}>
      <div className={styles.flow}>
        <div className={styles.box}>
          <div className={styles.role}>
            <L en="Client A · input" ko="클라이언트 A · 입력" />
          </div>
          <div className={styles.title}>
            <L en="Mobile" ko="모바일" />
          </div>
          <code className={styles.file}>mobile/page.tsx</code>
          <ul className={styles.steps}>
            <li>
              <Step n={2} /> <code>useSocket(&quot;drawing&quot;)</code>
              <br />
              <L en="joins the room" ko="room에 들어간다" />
            </li>
            <li>
              <Step n={3} /> <code>send(&quot;move&quot;, {"{ x, y }"})</code>
              <br />
              <L en="finger moves" ko="손가락이 움직인다" />
            </li>
          </ul>
        </div>

        <Wire n={3} en="send" ko="보낸다" />

        <div className={`${styles.box} ${styles.relay}`}>
          <div className={styles.role}>
            <L en="Relay server · port 4000" ko="Relay 서버 · 4000 포트" />
          </div>
          <div className={styles.title}>socket-server.mjs</div>
          <div className={styles.room}>
            <div className={styles.roomName}>room &quot;drawing&quot;</div>
            <div className={styles.members}>
              <span>
                <L en="mobile" ko="모바일" />
              </span>
              <span>
                <L en="screen" ko="스크린" />
              </span>
            </div>
          </div>
          <ul className={styles.steps}>
            <li>
              <Step n={4} />{" "}
              <L
                en="forwards the message to the rest of the room"
                ko="메시지를 room의 나머지에게 전달한다"
              />
            </li>
          </ul>
        </div>

        <Wire n={4} en="forward" ko="전달한다" />

        <div className={styles.box}>
          <div className={styles.role}>
            <L en="Client B · output" ko="클라이언트 B · 출력" />
          </div>
          <div className={styles.title}>
            <L en="Laptop screen" ko="노트북 스크린" />
          </div>
          <code className={styles.file}>screen/page.tsx</code>
          <ul className={styles.steps}>
            <li>
              <Step n={1} /> <code>useSocket(&quot;drawing&quot;, …)</code>
              <br />
              <L en="joins the room" ko="room에 들어간다" />
            </li>
            <li>
              <Step n={5} /> <code>onMessage(&quot;move&quot;, …)</code>
              <br />
              <L en="update → draw" ko="갱신 → 그린다" />
            </li>
          </ul>
        </div>
      </div>

      <figcaption className={styles.caption}>
        <L
          en="Next.js (port 3000) serves the two pages. The relay (port 4000) passes the messages. It works in both directions."
          ko="Next.js(3000 포트)가 두 페이지를 내준다. Relay(4000 포트)가 메시지를 넘긴다. 양방향 모두 된다."
        />
      </figcaption>
    </figure>
  );
}

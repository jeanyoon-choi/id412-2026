import type { App, Line } from "./apps";
import styles from "./phone.module.css";

// One phone showing one chat app. It is drawn at an iPhone's real size in points (390 × 844)
// and zoomed to fit; the app's look comes from the class named after its id (phone.module.css).
export function Phone({ app, lines, draft, waiting, zoom }: { app: App; lines: Line[]; draft: string; waiting: boolean; zoom: number }) {
  const friend = app.friends[0];

  return (
    <div className={`${styles.phone} ${styles[app.id]} ${styles[app.layout]}`} style={{ zoom }}>
      <div className={styles.statusBar}>
        <span>9:41</span>
        <span>●●●● 5G ▮</span>
      </div>

      <header className={styles.bar}>
        <span className={styles.back}>‹</span>
        <span className={styles.avatar} style={{ background: friend.tint }}>
          {friend.initial}
        </span>
        <span className={styles.heading}>
          <span className={styles.title}>{app.title}</span>
          <span className={styles.detail}>{app.detail}</span>
        </span>
      </header>

      {/* column-reverse: the newest line stays at the bottom, older ones are pushed up and out */}
      <div className={styles.thread}>
        <div className={styles.lines}>
          {lines.map((line, index) => {
            const mine = line.from < 0;
            const sender = mine ? null : app.friends[line.from];
            return (
              <div key={index} className={mine ? `${styles.line} ${styles.mine}` : styles.line}>
                <span className={styles.face} style={{ background: sender?.tint ?? "#888" }}>
                  {sender?.initial ?? "Y"}
                </span>
                <span className={styles.body}>
                  <span className={styles.name}>{sender?.name ?? "You"}</span>
                  <span className={styles.text}>{line.text}</span>
                </span>
              </div>
            );
          })}
          {waiting && (
            <div className={styles.line}>
              <span className={styles.face} style={{ background: friend.tint }}>
                {friend.initial}
              </span>
              <span className={styles.body}>
                <span className={`${styles.text} ${styles.dots}`}>•••</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* The composer shows what is being typed on the mobile, letter by letter */}
      <footer className={styles.composer}>
        <span className={styles.plus}>+</span>
        <span className={draft ? styles.field : `${styles.field} ${styles.empty}`}>{draft || "Message"}</span>
      </footer>
    </div>
  );
}

import Link from "next/link";
import styles from "./page.module.css";

export const metadata = { title: "final · ID412" };

// Replace this file with your final project. See docs/final/README.md.
export default function Final() {
  return (
    <main className={styles.root}>
      <p className={styles.crumb}>
        <Link href="/">ID412</Link> / final
      </p>
      <h1 className={styles.title}>Build the final project you dream of here.</h1>
      <p className={styles.sub}>여러분이 꿈꾸는 파이널 프로젝트를 여기, app/final/에 만들어보세요.</p>
      <ul className={styles.list}>
        <li>Start from the experiment you liked most: copy its folder here, give it its own socket room, grow it.</li>
        <li>Or start a fresh Next.js app from scratch (W1 §5) and bring over only what you need.</li>
        <li>Sound is mandatory. The guide is in docs/final/README.md. This page is the placeholder: replace it.</li>
      </ul>
    </main>
  );
}

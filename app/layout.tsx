import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "ID412 Web Workshop 2026",
  description: "KAIST ID412 Interactive Space — Creative Web Development Workshop",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className={styles.header}>
          <Link href="/">ID412</Link>
          <Link href="/lecture/prelim">Prelim</Link>
          <Link href="/lecture/w1">W1</Link>
          <Link href="/lecture/w2">W2</Link>
          <Link href="/lecture/w3">W3</Link>
        </nav>
        <main className={styles.main}>{children}</main>
      </body>
    </html>
  );
}

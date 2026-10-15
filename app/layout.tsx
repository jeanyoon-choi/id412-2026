import type { Metadata } from "next";
import "./globals.css";
import styles from "./layout.module.css";
import { BackToTop } from "./back-to-top";
import { Sidebar } from "./sidebar";

export const metadata: Metadata = {
  title: "ID412 Web Workshop 2026",
  description: "KAIST ID412 Interactive Space — Creative Web Development Workshop",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}',
          }}
        />
      </head>
      <body>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.content}>{children}</div>
        </main>
        <BackToTop />
      </body>
    </html>
  );
}

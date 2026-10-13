"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./sidebar.module.css";

const pages = [
  { href: "/", label: "Index", meta: "" },
  { href: "/lecture/prelim", label: "Prelim", meta: "before 10/26" },
  { href: "/lecture/w1", label: "Web 1", meta: "10/26" },
  { href: "/lecture/w2", label: "Web 2", meta: "11/9" },
  { href: "/lecture/w3", label: "Web 3", meta: "11/16" },
  { href: "/final", label: "Final", meta: "" },
];

type Heading = { id: string; text: string };

export function Sidebar() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    const nodes = Array.from(document.querySelectorAll<HTMLHeadingElement>("main h2[id]"));
    setHeadings(nodes.map((node) => ({ id: node.id, text: node.textContent ?? "" })));
    if (nodes.length === 0) {
      setActive("");
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = 120;
      let current = nodes[0].id;
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= line) current = node.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <>
      <div className={styles.bar}>
        <Link href="/" className={styles.barTitle}>
          ID412 Web
        </Link>
        <button
          type="button"
          className={styles.barButton}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Contents"}
        </button>
      </div>

      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <Link href="/" className={styles.title}>
          ID412 Interactive Space
          <span className={styles.subtitle}>Web Workshop 2026</span>
        </Link>

        <nav aria-label="Pages">
          <ol className={styles.pages}>
            {pages.map((page) => {
              const isActive = pathname === page.href;
              return (
                <li key={page.href} className={isActive ? styles.pageActive : styles.page}>
                  <Link href={page.href}>
                    <span>{page.label}</span>
                    {page.meta ? <span className={styles.meta}>{page.meta}</span> : null}
                  </Link>
                  {isActive && headings.length > 0 ? (
                    <ol className={styles.sections}>
                      {headings.map((heading) => (
                        <li
                          key={heading.id}
                          className={heading.id === active ? styles.sectionActive : styles.section}
                        >
                          <a href={`#${heading.id}`} onClick={() => setOpen(false)}>
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className={styles.footer}>
          <a href="https://github.com/jeanyoon-choi/id412-2026" target="_blank" rel="noopener noreferrer">github.com/jeanyoon-choi/id412-2026</a>
        </div>
      </aside>
    </>
  );
}

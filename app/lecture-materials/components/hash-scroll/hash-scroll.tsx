"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Makes "#section" links land on the right section.
// Every page holds its English and its Korean text at once, and a section has the same id in both,
// so the browser's own jump goes to the first one, which is hidden when the other language is shown.
// This goes to the one that is visible instead: on load, when the hash changes, and on a click.

function target() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return null;
  const all = document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`);
  return Array.from(all).find((node) => node.offsetParent !== null) ?? null; // offsetParent is null when hidden
}

function go() {
  target()?.scrollIntoView({ block: "start" });
}

export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // On arrival: now, and again once images have loaded and pushed the section down,
    // unless the reader has started scrolling by then.
    let touched = false;
    const touch = () => (touched = true);
    const again = () => !touched && go();
    go();
    const timers = [window.setTimeout(again, 300), window.setTimeout(again, 1200)];
    window.addEventListener("load", again);
    window.addEventListener("wheel", touch, { passive: true });
    window.addEventListener("touchmove", touch, { passive: true });
    window.addEventListener("hashchange", go);
    window.addEventListener("langchange", go); // the other language's section is now the visible one

    // A click on a link to a section of this same page.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || event.metaKey || event.ctrlKey) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      event.preventDefault();
      window.history.pushState(null, "", url.hash);
      go();
    };
    document.addEventListener("click", onClick);

    return () => {
      timers.forEach(window.clearTimeout);
      window.removeEventListener("load", again);
      window.removeEventListener("wheel", touch);
      window.removeEventListener("touchmove", touch);
      window.removeEventListener("hashchange", go);
      window.removeEventListener("langchange", go);
      document.removeEventListener("click", onClick);
    };
  }, [pathname]);

  return null;
}

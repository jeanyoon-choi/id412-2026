"use client";

import Link from "next/link";
import { useState } from "react";
import type { Experiment } from "./experiments";
import styles from "./experiment-index.module.css";

// A multi-device experiment has two pages. Screen first: it is the one to open on the laptop.
const DEVICES = [
  { route: "screen", hint: "laptop · output · open this one on the big screen" },
  { route: "mobile", hint: "phone · input · open this one on the phone" },
];

type Group = { key: string; label: string; href?: string; experiments: Experiment[] };

/**
 * The experiments index. Full page, black on white (or the reverse), one row
 * per experiment: name · description · date · routes →. Weeks collapse.
 * A multi-device experiment is a heading with one indented row per device.
 * Experiments open in a new tab, so the index stays open.
 */
export function ExperimentIndex({ groups, scope }: { groups: Group[]; scope?: string }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const total = groups.reduce((sum, group) => sum + group.experiments.length, 0);

  const toggle = (key: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Link href="/" className={styles.home}>
            ID412
          </Link>
          <span className={styles.slash}>/</span>
          {scope ? (
            <>
              <Link href="/experiments" className={styles.home}>
                experiments
              </Link>
              <span className={styles.slash}>/</span>
              <span>{scope}</span>
            </>
          ) : (
            <span>experiments</span>
          )}
        </h1>
        <span className={styles.total}>{total}</span>
        <Link href="/final" className={styles.headerLink}>
          final →
        </Link>
      </header>

      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.key);
        return (
          <section key={group.key}>
            <div className={styles.groupHeader}>
              <button type="button" className={styles.groupToggle} aria-expanded={!isCollapsed} onClick={() => toggle(group.key)}>
                <span aria-hidden="true" className={styles.caret}>
                  {isCollapsed ? "▶" : "▼"}
                </span>
                <span>{group.label}</span>
                <span className={styles.count}>{group.experiments.length}</span>
              </button>
              {group.href && !scope ? (
                <Link href={group.href} className={styles.groupLink}>
                  {group.href} →
                </Link>
              ) : null}
            </div>
            {isCollapsed ? null : group.experiments.length === 0 ? (
              <p className={styles.empty}>
                nothing yet · create app/experiments/{group.key}/&lt;name&gt;/page.tsx
              </p>
            ) : (
              group.experiments.map((experiment) =>
                experiment.multiDevice ? (
                  // Two devices: the name is a heading, each device gets its own line below it.
                  <div key={experiment.href}>
                    <div className={`${styles.row} ${styles.parent}`}>
                      <span className={styles.name}>{experiment.name}</span>
                      <span className={styles.phrase}>{experiment.description}</span>
                      <time dateTime={experiment.updated} className={styles.date}>
                        {experiment.updated.replaceAll("-", ".")}
                      </time>
                      <span className={styles.routes}>2 devices · open both ↓</span>
                    </div>
                    {DEVICES.map((device) => {
                      const href = `/experiments/${experiment.week}/${experiment.name}/${device.route}`;
                      return (
                        <div key={device.route} className={`${styles.row} ${styles.device}`}>
                          <Link href={href} target="_blank" className={styles.name} data-experiment>
                            <span aria-hidden="true" className={styles.branch}>
                              └
                            </span>
                            {device.route}
                          </Link>
                          <span className={styles.phrase}>{device.hint}</span>
                          <span />
                          <span className={styles.routes}>{href}</span>
                          <span aria-hidden="true" className={styles.arrow}>
                            →
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div key={experiment.href} className={styles.row}>
                    <Link href={experiment.href} target="_blank" className={styles.name} data-experiment>
                      {experiment.name}
                    </Link>
                    <span className={styles.phrase}>{experiment.description}</span>
                    <time dateTime={experiment.updated} className={styles.date}>
                      {experiment.updated.replaceAll("-", ".")}
                    </time>
                    <span className={styles.routes}>{experiment.href}</span>
                    <span aria-hidden="true" className={styles.arrow}>
                      →
                    </span>
                  </div>
                ),
              )
            )}
          </section>
        );
      })}
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/hooks/shared/useSocket";
import { NO_STATS, type Controls, type LayerKey, type Stats } from "../controls";
import { Navigate } from "./Navigate";
import { Settings } from "./Settings";
import { Statistics } from "./Statistics";
import styles from "./page.module.css";

const MODES = ["Settings", "Navigate", "Statistics"];

// The mobile has three modes, side by side like the pages of an iOS app:
// Settings (the city's parameters), Navigate (the camera, as in a maps app), Statistics (what the city is doing).
export default function CityMobile() {
  const [mode, setMode] = useState(0);
  const [river, setRiver] = useState(false); // for the map
  const [layer, setLayer] = useState<LayerKey>("people");
  const [stats, setStats] = useState<Stats>(NO_STATS);

  // The screen sends the city's figures back: messages go both ways.
  const onMessage = useCallback((type: string, data: unknown) => {
    if (type === "stats") setStats(data as Stats);
  }, []);
  const { send, connected, status } = useSocket("3d-city", onMessage);

  // The screen shows statistics only while the mobile is in Statistics mode.
  useEffect(() => {
    send("layer", mode === 2 ? layer : null);
  }, [send, connected, mode, layer]);

  function onControls(controls: Controls) {
    send("controls", controls); // everything every time: a screen that joins late is right after one touch
    setRiver(controls.switches[2]);
  }

  return (
    <main className={styles.container}>
      {/* The mode switch: an iOS segmented control, its selection a piece of glass that slides */}
      <div className={styles.modes}>
        <div className={styles.selection} style={{ transform: `translateX(${mode * 100}%)` }} />
        {MODES.map((name, index) => (
          <button key={name} className={index === mode ? styles.selected : undefined} onPointerDown={() => setMode(index)}>
            {name}
          </button>
        ))}
      </div>

      {/* The three pages, side by side; the row slides */}
      <div className={styles.pages}>
        <div className={styles.row} style={{ transform: `translateX(${mode * -100}%)` }}>
          <Settings onChange={onControls} />
          <Navigate river={river} onChange={(view) => send("view", view)} />
          <Statistics stats={stats} layer={layer} onChange={setLayer} />
        </div>
      </div>
      {!connected && <p className={styles.status}>{status}</p>}
    </main>
  );
}

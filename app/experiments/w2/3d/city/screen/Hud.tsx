import { LAYERS, short, valueText, type LayerKey, type Stats } from "../controls";
import { RAMPS, curveOf } from "./stats";
import styles from "./page.module.css";

// The figures over the city while the mobile is in Statistics mode.
export function Hud({ layer, stats, time }: { layer: LayerKey; stats: Stats; time: number }) {
  const item = LAYERS.find((one) => one.key === layer)!;
  const figure = (key: LayerKey) => (key === "gdp" ? `$${short(stats.gdp)}` : short(stats[key]));
  // The statistic's activity over 24 hours, as a line 240 wide and 48 high.
  const curve = Array.from({ length: 97 }, (_, k) => `${(k / 96) * 240},${46 - curveOf(layer, k / 96) * 44}`).join(" ");
  const buildings = layer === "people" || layer === "gdp";

  return (
    <div className={styles.hud}>
      <p className={styles.layer}>{item.name}</p>
      <p className={styles.figure}>{figure(layer)}</p>
      <p className={styles.unit}>{item.unit}</p>

      <svg className={styles.curve} viewBox="0 0 240 48">
        <polyline points={curve} />
        <line x1={time * 240} x2={time * 240} y1="0" y2="48" />
      </svg>
      <p className={styles.axis}>
        <span>00:00</span>
        <span>{valueText("time", time)}</span>
        <span>24:00</span>
      </p>

      {buildings ? (
        <p className={styles.legend}>
          low <i style={{ background: `linear-gradient(90deg, ${RAMPS[layer].join(", ")})` }} /> high · per building
        </p>
      ) : (
        <p className={styles.legend}>
          <b style={{ background: layer === "freight" ? "#ffb333" : "#80f2ff" }} /> {layer === "freight" ? "truck" : "vehicle"} · {Math.round(stats.speed)} km/h average
        </p>
      )}

      <div className={styles.others}>
        {LAYERS.filter((one) => one.key !== layer).map((one) => (
          <p key={one.key}>
            <span>{one.name}</span>
            <b>{figure(one.key)}</b>
            <span>{one.unit}</span>
          </p>
        ))}
        <p>
          <span>Buildings</span>
          <b>{stats.buildings.toLocaleString("en")}</b>
          <span>{short(stats.area)} m² of floor</span>
        </p>
      </div>
    </div>
  );
}

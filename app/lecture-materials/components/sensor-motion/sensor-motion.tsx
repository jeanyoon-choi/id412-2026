import styles from "./sensor-motion.module.css";

// A small looping drawing for each mobile input of W2 §6: how the hand and the mobile move.
// Line drawings in the text colour, animated with CSS only.
type Kind = "tilt" | "shake" | "microphone" | "camera";

// The mobile in a hand: the hand behind, the mobile, the thumb in front. Drawn around (36, 40).
function HandWithMobile({ children }: { children?: React.ReactNode }) {
  return (
    <>
      {/* Palm and fingers, behind the mobile */}
      <path className={styles.skin} d="M22 44 q-3 2 -3 7 v9 q0 6 6 6 h20 q8 0 8 -8 v-20 q0 -3 -3 -3 t-3 3" />
      <path className={styles.line} d="M50 41 h4 M50 47 h4 M50 53 h4" />
      {/* The mobile */}
      <rect className={styles.mobile} x="24" y="14" width="24" height="44" rx="5" />
      <path className={styles.line} d="M33 18 h6" />
      {children}
      {/* The thumb, in front */}
      <path className={styles.skin} d="M19 50 q0 -8 6 -9 q5 -1 5 4 q0 4 -5 6" />
    </>
  );
}

export function SensorMotion({ kind }: { kind: Kind }) {
  return (
    <svg className={styles.svg} viewBox="0 0 72 72" role="img" aria-label={kind}>
      {kind === "tilt" && (
        // The mobile leans left and right; the dot on its screen rolls to the low side.
        <g className={styles.tilt}>
          <HandWithMobile>
            <circle className={`${styles.dot} ${styles.roll}`} cx="36" cy="34" r="3" />
          </HandWithMobile>
        </g>
      )}

      {kind === "shake" && (
        <>
          {/* Short lines at both sides: it is moving fast */}
          <path className={`${styles.line} ${styles.blink}`} d="M12 24 q-4 10 0 20 M6 28 q-3 6 0 12 M60 24 q4 10 0 20 M66 28 q3 6 0 12" />
          <g className={styles.shake}>
            <HandWithMobile />
          </g>
        </>
      )}

      {kind === "microphone" && (
        <>
          {/* Sound arrives from the left, wave after wave */}
          <path className={`${styles.line} ${styles.wave1}`} d="M17 26 q-5 8 0 16" />
          <path className={`${styles.line} ${styles.wave2}`} d="M11 22 q-7 12 0 24" />
          <path className={`${styles.line} ${styles.wave3}`} d="M5 18 q-9 16 0 32" />
          <HandWithMobile>
            {/* The level on the screen */}
            <rect className={`${styles.bar} ${styles.level1}`} x="29" y="26" width="3" height="16" rx="1.5" />
            <rect className={`${styles.bar} ${styles.level2}`} x="34.5" y="26" width="3" height="16" rx="1.5" />
            <rect className={`${styles.bar} ${styles.level3}`} x="40" y="26" width="3" height="16" rx="1.5" />
          </HandWithMobile>
        </>
      )}

      {kind === "camera" && (
        <>
          <HandWithMobile>
            {/* The picture on the screen: a frame that flashes when the photo is taken */}
            <rect className={`${styles.bar} ${styles.flash}`} x="27" y="22" width="18" height="26" rx="2" />
            <circle className={`${styles.line} ${styles.shutter}`} cx="36" cy="35" r="5" />
          </HandWithMobile>
          {/* What the camera looks at: the corners of its view */}
          <path className={`${styles.line} ${styles.blink}`} d="M56 12 h8 v8 M64 30 v8 h-8" />
        </>
      )}
    </svg>
  );
}

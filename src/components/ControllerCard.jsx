import Gauge from "./Gauge";
import styles from "./ControllerCard.module.css";

export default function ControllerCard({ controller, onSelect }) {
  const { label, battery, charging, connection, selected } = controller;

  return (
    <button
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Control ${label}`}
    >
      <span className={styles.badge}>{selected ? "Controlling" : ""}</span>

      <Gauge
        compact
        battery={battery}
        charging={charging}
        connected
        connection={connection}
      />

      <span className={styles.label}>{label}</span>
    </button>
  );
}

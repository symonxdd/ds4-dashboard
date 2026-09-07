import Gauge from "./Gauge";
import ControllerName from "./ControllerName";
import styles from "./ControllerCard.module.css";

export default function ControllerCard({ controller, onSelect, onRename }) {
  const { label, battery, charging, connection, selected } = controller;

  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Select ${label}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <span className={styles.badge}>{selected ? "Selected" : ""}</span>

      <Gauge
        compact
        battery={battery}
        charging={charging}
        connected
        connection={connection}
      />

      <ControllerName label={label} onRename={onRename} />
    </div>
  );
}

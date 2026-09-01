import styles from "./StatusBadges.module.css";

export default function StatusBadges({ connected }) {
  if (connected) return null;

  return (
    <div className={styles.badges}>
      <span className={`${styles.badge} ${styles.disconnected}`}>No controller connected</span>
      <span className={styles.hint}>Connect your controller through USB or Bluetooth</span>
    </div>
  );
}

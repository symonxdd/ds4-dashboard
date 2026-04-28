import { Bluetooth, Usb, Zap } from "lucide-react";
import styles from "./StatusBadges.module.css";

export default function StatusBadges({ connected, connection, charging }) {
  const isBT = connection === "Bluetooth";

  return (
    <div className={styles.badges}>
      {connected ? null : (
        <span className={`${styles.badge} ${styles.disconnected}`}>No controller connected</span>
      )}
    </div>
  );
}


import { Bluetooth, Usb, Zap } from "lucide-react";
import styles from "./StatusBadges.module.css";

export default function StatusBadges({ connected, connection, charging }) {
  const isBT = connection === "Bluetooth";

  return (
    <div className={styles.badges}>
      {connected ? (
        <>
          <div className={`${styles.badge} ${styles.conn}`}>
            {isBT ? <Bluetooth size={14} /> : <Usb size={14} />}
            <span className={styles.connLabel}>
              {isBT ? "Connected over Bluetooth" : "Connected over USB"}
            </span>
          </div>
          {charging && (
            <div className={`${styles.badge} ${styles.charging}`}>
              <Zap size={14} className={styles.zapIcon} />
              <span>Charging</span>
            </div>
          )}
        </>
      ) : (
        <span className={`${styles.badge} ${styles.disconnected}`}>No controller connected</span>
      )}
    </div>
  );
}


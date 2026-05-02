import styles from "./Settings.module.css"; // Reuse the same modal styles

export default function DeviceInfoModal({ open, onClose, status }) {
  return (
    <div
      className={`${styles.overlay} ${open ? styles.visible : ""}`}
      onClick={onClose}
      data-no-drag="true"
    >
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Device Information</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.group}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Model</span>
              <span className={styles.infoValue} style={{ opacity: 0.6 }}>
                {status.connected ? `DualShock 4 ${status.is_v2 ? "v2" : "v1"}` : ""}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Vendor ID</span>
              <span className={styles.infoValue} style={{ opacity: 0.6 }}>
                {status.connected ? `0x${status.vendor_id?.toString(16).toUpperCase().padStart(4, '0')}` : ""}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Product ID</span>
              <span className={styles.infoValue} style={{ opacity: 0.6 }}>
                {status.connected ? `0x${status.product_id?.toString(16).toUpperCase().padStart(4, '0')}` : ""}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.infoBox}>
          This data is retrieved from the controller through HID.
        </div>
      </div>
    </div>
  );
}

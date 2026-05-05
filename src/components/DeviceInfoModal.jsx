import Modal from "./Modal";
import styles from "./DeviceInfoModal.module.css";

export default function DeviceInfoModal({ open, onClose, status }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Device Information"
    >
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
    </Modal>
  );
}

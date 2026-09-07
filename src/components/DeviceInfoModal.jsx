import { openUrl } from "@tauri-apps/plugin-opener";
import Modal from "./Modal";
import styles from "./DeviceInfoModal.module.css";

// Controllers that expose no MAC fall back to an id built from their HID path,
// which is an implementation detail rather than something worth showing.
function address(controller) {
  const id = controller?.id ?? "";
  return id.startsWith("path:") ? "" : id.toUpperCase();
}

function hex(value) {
  return value === undefined ? "" : `0x${value.toString(16).toUpperCase().padStart(4, "0")}`;
}

export default function DeviceInfoModal({ open, onClose, controller }) {
  const fields = [
    ["Model", controller ? `DualShock 4 ${controller.is_v2 ? "v2" : "v1"}` : ""],
    ["Bluetooth MAC", controller ? address(controller) : ""],
    ["Vendor ID", controller ? hex(controller.vendor_id) : ""],
    ["Product ID", controller ? hex(controller.product_id) : ""],
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Device Information"
    >
      <div className={styles.group}>
        <div className={styles.infoGrid}>
          {fields.map(([label, value]) => (
            <div key={label} className={styles.infoItem}>
              <span className={styles.infoLabel}>{label}</span>
              <span className={styles.infoValue} style={{ opacity: 0.6 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.infoBox}>
        This data is retrieved from the controller through the{" "}
        <span
          className={styles.hidLink}
          onClick={() => openUrl("https://en.wikipedia.org/wiki/Human_interface_device")}
        >
          HID
        </span>{" "}
        protocol.
      </div>
    </Modal>
  );
}

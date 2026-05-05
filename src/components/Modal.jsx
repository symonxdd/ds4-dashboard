import { X } from "lucide-react";
import styles from "./Modal.module.css";

export default function Modal({ open, onClose, title, children, className, headerClassName }) {
  return (
    <div
      className={`${styles.overlay} ${open ? styles.visible : ""}`}
      onClick={onClose}
      data-no-drag="true"
    >
      <div className={`${styles.card} ${className || ""}`} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.modalHeader} ${headerClassName || ""}`}>
          <h2>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

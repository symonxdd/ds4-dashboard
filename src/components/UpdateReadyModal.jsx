import Modal from "./Modal";
import styles from "./UpdateReadyModal.module.css";

export default function UpdateReadyModal({
  status,
  updateVersion,
  showInstallModal,
  installNow,
  installLater,
}) {
  const readyOpen = status === "downloaded" && showInstallModal;

  return (
    <Modal open={readyOpen} onClose={installLater} title="Update ready to install">
      <div className={styles.body}>
        <p>
          DS4 Dashboard {updateVersion ? `v${updateVersion} ` : ""}has finished
          downloading and is ready to install.
        </p>
        <p className={styles.note}>
          Installing will close DS4 Dashboard, apply the update, and reopen
          it automatically. It only takes a few seconds.
        </p>
      </div>
      <div className={styles.actions}>
        <button className={styles.primaryBtn} onClick={installNow}>
          Install Now
        </button>
        <button className={styles.secondaryBtn} onClick={installLater}>
          Install Later
        </button>
      </div>
    </Modal>
  );
}

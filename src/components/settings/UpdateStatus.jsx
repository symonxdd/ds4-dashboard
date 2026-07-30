import { Download, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";
import styles from "./UpdateStatus.module.css";

export default function UpdateStatus({ updater }) {
  const {
    status,
    updateVersion,
    progress,
    error,
    repoUrl,
    downloadUpdate,
  } = updater;

  if (status === "idle") return null;

  const releaseTagUrl = updateVersion ? `${repoUrl}/releases/tag/v${updateVersion}` : `${repoUrl}/releases/latest`;

  const percent =
    progress.total && progress.total > 0
      ? Math.min(100, Math.round((progress.downloaded / progress.total) * 100))
      : null;

  return (
    <div className={styles.updateRow}>
      <div className={styles.updateInfo}>
        {status === "available" && (
          <span className={styles.updateLabel}>Update available: v{updateVersion}</span>
        )}
        {status === "downloading" && (
          <span className={styles.updateLabel}>
            Downloading v{updateVersion}
            {percent !== null ? ` (${percent}%)` : "..."}
          </span>
        )}
        {status === "downloaded" && (
          <span className={styles.updateLabel}>Update ready: v{updateVersion}</span>
        )}
        {status === "installing" && (
          <span className={styles.updateLabel}>Installing v{updateVersion}...</span>
        )}

        {status === "downloading" && (
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: percent !== null ? `${percent}%` : "35%" }}
            />
          </div>
        )}

        {error && (
          <span className={styles.errorLabel}>
            <AlertCircle size={12} /> {error}
          </span>
        )}
      </div>

      <div className={styles.updateActions}>
        {status === "available" && (
          <>
            <button className={styles.actionBtn} onClick={downloadUpdate}>
              <Download size={13} /> Download
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => openUrl(releaseTagUrl)}
              aria-label="View on GitHub"
              data-tooltip="View on GitHub"
            >
              <ExternalLink size={13} />
            </button>
          </>
        )}

        {status === "downloaded" && (
          <button className={styles.actionBtn} onClick={updater.installNow}>
            Install
          </button>
        )}

        {status === "installing" && <Loader2 size={14} className={styles.spinner} />}
      </div>
    </div>
  );
}

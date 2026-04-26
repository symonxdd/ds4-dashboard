import { useState, useEffect } from "react";
import styles from "./Settings.module.css";

export default function Settings({ open, onClose, status }) {
  const [remoteVersion, setRemoteVersion] = useState(null);
  const currentVersion = "0.1.0";
  const repoUrl = "https://github.com/symonxdd/ds4-dashboard";

  useEffect(() => {
    fetch("https://api.github.com/repos/symonxdd/ds4-dashboard/releases/latest")
      .then(res => res.json())
      .then(data => {
        if (data.tag_name) {
          const clean = data.tag_name.startsWith("v") ? data.tag_name.slice(1) : data.tag_name;
          setRemoteVersion(clean);
        }
      })
      .catch(() => { });
  }, []);

  const isNewer = (remote, local) => {
    if (!remote) return false;
    const r = remote.split(".").map(Number);
    const l = local.split(".").map(Number);
    for (let i = 0; i < 3; i++) {
      if (r[i] > l[i]) return true;
      if (r[i] < l[i]) return false;
    }
    return false;
  };

  const updateAvailable = isNewer(remoteVersion, currentVersion);
  const env = import.meta.env.DEV ? "dev" : "release";

  return (
    <div
      className={`${styles.overlay} ${open ? styles.visible : ""}`}
      onClick={onClose}
      data-no-drag="true"
    >
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Settings</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Tray Icon</label>
          <div className={styles.infoBox}>
            The tray icon is currently set to <b>Gauge Style</b>. More options
            coming soon.
          </div>
        </div>

        <div className={styles.footer}>
          v{currentVersion} ({env}
          {remoteVersion ? (
            <>
              , {" "}
              <span
                className={updateAvailable ? styles.updateLink : styles.latestText}
                data-tooltip={updateAvailable ? "A new version is available on GitHub" : "You are using the latest version"}
                onClick={() => updateAvailable && window.open(`${repoUrl}/releases/latest`, "_blank")}
              >
                {updateAvailable ? "update available" : "latest"}
              </span>
            </>
          ) : ""})
        </div>
      </div>
    </div>
  );
}

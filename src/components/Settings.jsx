import { useState, useEffect } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import styles from "./Settings.module.css";

export default function Settings({ open, onClose, status }) {
  const [remoteVersion, setRemoteVersion] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);

  const repoUrl = "https://github.com/symonxdd/ds4-dashboard";

  useEffect(() => {
    // Get local version from Tauri
    getVersion().then(setCurrentVersion);

    // Fetch latest GitHub release
    fetch("https://api.github.com/repos/symonxdd/ds4-dashboard/releases/latest")
      .then((res) => res.json())
      .then((data) => {
        if (data.tag_name) {
          const clean = data.tag_name.startsWith("v")
            ? data.tag_name.slice(1)
            : data.tag_name;
          setRemoteVersion(clean);
        }
      })
      .catch(() => { });
  }, []);

  const isNewer = (remote, local) => {
    if (!remote || !local) return false;

    const r = remote.split(".").map(Number);
    const l = local.split(".").map(Number);

    for (let i = 0; i < 3; i++) {
      if ((r[i] || 0) > (l[i] || 0)) return true;
      if ((r[i] || 0) < (l[i] || 0)) return false;
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
          v{currentVersion ?? "…"} ({env}
          {remoteVersion && currentVersion && (
            <>
              ,{" "}
              <span
                className={
                  updateAvailable
                    ? styles.updateLink
                    : styles.latestText
                }
                data-tooltip={
                  updateAvailable
                    ? "A new version is available on GitHub"
                    : "You are using the latest version"
                }
                onClick={async () => {
                  if (updateAvailable) {
                    await openUrl(`${repoUrl}/releases/latest`);
                  }
                }}
              >
                {updateAvailable ? "update available" : "latest"}
              </span>
            </>
          )}
          )
        </div>
      </div>
    </div>
  );
}
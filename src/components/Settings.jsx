import { useState, useEffect } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import styles from "./Settings.module.css";

export default function Settings({ open, onClose, status }) {
  const [remoteVersion, setRemoteVersion] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [autostartEnabled, setAutostartEnabled] = useState(false);
  const [trayVisible, setTrayVisible] = useState(() => {
    const saved = localStorage.getItem("tray_visible");
    return saved === null ? true : saved === "true";
  });
  const [closeToTray, setCloseToTray] = useState(() => {
    const saved = localStorage.getItem("close_to_tray");
    return saved === null ? false : saved === "true";
  });

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

    // Check autostart status
    isEnabled().then(setAutostartEnabled);
  }, []);

  useEffect(() => {
    // Initial sync of tray visibility
    invoke("toggle_tray_icon", { visible: trayVisible }).catch(console.error);
    invoke("toggle_close_to_tray", { enabled: closeToTray }).catch(console.error);
  }, [trayVisible, closeToTray]);

  const handleAutostartToggle = async () => {
    try {
      if (autostartEnabled) {
        await disable();
        setAutostartEnabled(false);
        localStorage.setItem("autostart", "false");
      } else {
        await enable();
        setAutostartEnabled(true);
        localStorage.setItem("autostart", "true");
      }
    } catch (err) {
      console.error("Failed to toggle autostart:", err);
    }
  };

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
          <label className={styles.label}>General</label>
          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <span className={styles.settingTitle}>Start with Windows</span>
              <span className={styles.settingDesc}>Automatically run the dashboard when you log in</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={autostartEnabled}
                onChange={handleAutostartToggle}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.settingItem}>
            <div className={styles.settingLabel}>
              <span className={styles.settingTitle}>Show Tray Icon</span>
              <span className={styles.settingDesc}>Keep the dashboard running in the system tray</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={trayVisible}
                onChange={(e) => {
                  const val = e.target.checked;
                  setTrayVisible(val);
                  localStorage.setItem("tray_visible", val.toString());
                  
                  // UX: If tray is disabled, we must also disable minimize to tray
                  if (!val) {
                    setCloseToTray(false);
                    localStorage.setItem("close_to_tray", "false");
                    invoke("toggle_close_to_tray", { enabled: false }).catch(console.error);
                  }
                }}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={`${styles.settingItem} ${!trayVisible ? styles.disabled : ""}`}>
            <div className={styles.settingLabel}>
              <span className={styles.settingTitle}>Minimize to Tray</span>
              <span className={styles.settingDesc}>Keep the app running in the background when closed</span>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={closeToTray}
                disabled={!trayVisible}
                onChange={(e) => {
                  const val = e.target.checked;
                  setCloseToTray(val);
                  localStorage.setItem("close_to_tray", val.toString());
                }}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
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
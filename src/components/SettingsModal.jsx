import { useState, useEffect } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import { SiGithub } from "react-icons/si";
import Modal from "./Modal";
import styles from "./SettingsModal.module.css";

// Sub-components
import TabNav from "./settings/TabNav";
import GeneralTab from "./settings/GeneralTab";
import EmulationTab from "./settings/EmulationTab";
import TrayTab from "./settings/TrayTab";
import AboutTab from "./settings/AboutTab";



export default function SettingsModal({ open, onClose }) {
  const [activeTab, setActiveTab] = useState("general");
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

  const [mouseEmulation, setMouseEmulation] = useState(() => {
    const saved = localStorage.getItem("mouse_emulation");
    return saved === "true";
  });

  const [stickEmulation, setStickEmulation] = useState(() => {
    const saved = localStorage.getItem("stick_emulation");
    return saved === "true";
  });

  const [appIcon, setAppIcon] = useState(() => {
    const saved = localStorage.getItem("app_icon");
    return saved || "default";
  });

  const [startMinimized, setStartMinimized] = useState(() => {
    const saved = localStorage.getItem("start_minimized");
    return saved === "true";
  });

  const repoUrl = "https://github.com/symonxdd/ds4-dashboard";

  useEffect(() => {
    getVersion().then(setCurrentVersion);
    fetch("https://api.github.com/repos/symonxdd/ds4-dashboard/releases/latest")
      .then((res) => res.json())
      .then((data) => {
        if (data.tag_name) {
          const clean = data.tag_name.startsWith("v") ? data.tag_name.slice(1) : data.tag_name;
          setRemoteVersion(clean);
        }
      })
      .catch(() => { });

    isEnabled().then(setAutostartEnabled);
  }, []);

  useEffect(() => {
    invoke("toggle_tray_icon", { visible: trayVisible }).catch(console.error);
    invoke("toggle_close_to_tray", { enabled: closeToTray }).catch(console.error);
    invoke("toggle_mouse_emulation", { enabled: mouseEmulation }).catch(console.error);
    invoke("toggle_stick_emulation", { enabled: stickEmulation }).catch(console.error);
    invoke("set_app_icon", { name: appIcon }).catch(console.error);
    localStorage.setItem("app_icon", appIcon);
    localStorage.setItem("start_minimized", startMinimized);
  }, [trayVisible, closeToTray, mouseEmulation, stickEmulation, appIcon, startMinimized]);

  useEffect(() => {
    // If autostart is enabled, we need to re-enable it with/without the --minimized flag
    // to keep the system entry in sync with the current 'startMinimized' setting.
    if (autostartEnabled) {
      const args = startMinimized ? ["--minimized"] : [];
      enable(args).catch(console.error);
    }
  }, [startMinimized]);

  const handleAutostartToggle = async () => {
    try {
      if (autostartEnabled) {
        await disable();
        setAutostartEnabled(false);
        localStorage.setItem("autostart", "false");
      } else {
        const args = startMinimized ? ["--minimized"] : [];
        await enable(args);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <GeneralTab
            autostartEnabled={autostartEnabled}
            handleAutostartToggle={handleAutostartToggle}
            appIcon={appIcon}
            setAppIcon={setAppIcon}
            startMinimized={startMinimized}
            setStartMinimized={setStartMinimized}
          />
        );
      case "emulation":
        return (
          <EmulationTab
            mouseEmulation={mouseEmulation}
            setMouseEmulation={setMouseEmulation}
            stickEmulation={stickEmulation}
            setStickEmulation={setStickEmulation}
          />
        );
      case "tray":
        return (
          <TrayTab
            trayVisible={trayVisible}
            setTrayVisible={setTrayVisible}
            closeToTray={closeToTray}
            setCloseToTray={setCloseToTray}
            invoke={invoke}
          />
        );
      case "about":
        return <AboutTab appIcon={appIcon} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Settings"
      className={styles.settingsCard}
      headerClassName={styles.settingsHeader}
    >
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className={styles.contentArea}>
        {renderTabContent()}
      </div>

      <div className={styles.footer}>
        <span className={styles.footerText}>DS4 Dashboard v{currentVersion ?? "…"} ({env}{remoteVersion && currentVersion && <>{", "}<span className={updateAvailable ? styles.updateLink : styles.latestText} data-tooltip={updateAvailable ? "A new version is available on GitHub" : "You are using the latest version"} onClick={async () => { if (updateAvailable) { await openUrl(`${repoUrl}/releases/latest`); } }}>{updateAvailable ? "update available" : "latest"}</span></>})</span>
        <button
          className={styles.githubBtn}
          onClick={() => openUrl(repoUrl)}
          aria-label="View source"
          data-tooltip="View source"
        >
          <SiGithub size={14} />
        </button>
      </div>
    </Modal>
  );
}
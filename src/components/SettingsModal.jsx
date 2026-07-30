import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import Modal from "./Modal";
import styles from "./SettingsModal.module.css";

// Sub-components
import TabNav from "./settings/TabNav";
import GeneralTab from "./settings/GeneralTab";
import EmulationTab from "./settings/EmulationTab";
import TrayTab from "./settings/TrayTab";
import AboutTab from "./settings/AboutTab";



export default function SettingsModal({ open, onClose, showAppreciationIcon, setShowAppreciationIcon, updater }) {
  const [activeTab, setActiveTab] = useState("general");
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

  useEffect(() => {
    isEnabled().then(setAutostartEnabled);
  }, []);

  useEffect(() => {
    invoke("toggle_tray_icon", { visible: trayVisible }).catch(console.error);
    invoke("toggle_close_to_tray", { enabled: closeToTray }).catch(console.error);
    invoke("toggle_mouse_emulation", { enabled: mouseEmulation }).catch(console.error);
    invoke("toggle_stick_emulation", { enabled: stickEmulation }).catch(console.error);
    // Persisted to disk (not just localStorage) because the Rust side needs to read this
    // preference during startup, before the webview and its localStorage exist.
    invoke("set_start_minimized", { enabled: startMinimized }).catch(console.error);
    localStorage.setItem("start_minimized", startMinimized);
  }, [trayVisible, closeToTray, mouseEmulation, stickEmulation, startMinimized]);

  useEffect(() => {
    invoke("set_app_icon", { id: appIcon }).catch(console.error);
    localStorage.setItem("app_icon", appIcon);
  }, [appIcon]);

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
            showAppreciationIcon={showAppreciationIcon}
            setShowAppreciationIcon={setShowAppreciationIcon}
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
        return (
          <AboutTab
            appIcon={appIcon}
            env={env}
            updater={updater}
          />
        );
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
    </Modal>
  );
}
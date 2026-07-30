import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Settings as SettingsIcon, Info as InfoIcon, Sun, Moon, Heart } from "lucide-react";

// Components
import Gauge from "./components/Gauge";
import StatusBadges from "./components/StatusBadges";
import SettingsModal from "./components/SettingsModal";
import DeviceInfoModal from "./components/DeviceInfoModal";
import AppreciationModal from "./components/AppreciationModal";
import UpdateReadyModal from "./components/UpdateReadyModal";
import ColorPicker from "./components/ColorPicker";
import { useTheme } from "./context/ThemeContext";
import { useUpdater } from "./hooks/useUpdater";

// Styles
import styles from "./App.module.css";

function App() {
  const [status, setStatus] = useState({
    connected: false,
    connection: null,
    battery: 0,
    charging: false,
    vendor_id: null,
    product_id: null,
    is_v2: null,
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [appreciationOpen, setAppreciationOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const updater = useUpdater();

  const [showAppreciationIcon, setShowAppreciationIcon] = useState(() => {
    const saved = localStorage.getItem("show_appreciation_icon");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("show_appreciation_icon", showAppreciationIcon);
  }, [showAppreciationIcon]);

  useEffect(() => {
    // 1. Initial status fetch
    invoke("get_ds4_status").then(setStatus).catch(console.error);

    // 2. Listen for real-time updates from Rust
    const unlisten = listen("ds4-status-update", (event) => {
      setStatus(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) {
      getCurrentWindow().setTitle("DS4 Dashboard (dev)");
    }

    // Initial sync of lightbar color from localStorage to backend
    const saved = localStorage.getItem("lightbar_color");
    if (saved) {
      try {
        const { r, g, b } = JSON.parse(saved);
        invoke("set_output_state", { r, g, b, smallRumble: 0, largeRumble: 0 }).catch(() => {});
      } catch (e) {}
    }

    // Initial sync of app icon
    const savedIcon = localStorage.getItem("app_icon");
    if (savedIcon) {
      invoke("set_app_icon", { id: savedIcon }).catch(() => {});
    }
  }, []);

  const { connected, connection, battery, charging } = status;

  return (
    <main className={styles.dashboard}>
      {/* Theme Toggle + Appreciation (Left) */}
      <div className={styles.leftActions}>
        <button
          className={styles.themeToggleBtn}
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {theme === "dark" || (theme === "system_default" && window.matchMedia("(prefers-color-scheme: dark)").matches)
            ? <Moon size={20} />
            : <Sun size={20} />
          }
        </button>

        {showAppreciationIcon && (
          <button
            className={styles.actionBtn}
            onClick={() => setAppreciationOpen(true)}
            aria-label="Support this project"
          >
            <Heart size={18} />
          </button>
        )}
      </div>

      {/* Action Buttons (Right) */}
      <div className={styles.rightActions}>
        <button 
          className={styles.actionBtn} 
          onClick={() => setInfoOpen(true)}
          aria-label="View Device Info"
        >
          <InfoIcon size={18} />
        </button>

        <button 
          className={styles.actionBtn} 
          onClick={() => setSettingsOpen(true)}
          aria-label="Open Settings"
        >
          <SettingsIcon size={20} />
        </button>
      </div>

      <div className={`${styles.content} ${!connected ? styles.contentEmpty : ""}`}>
        {connected && (
          <div className={styles.gaugeSection}>
            <Gauge
              battery={battery}
              charging={charging}
              connected={connected}
              connection={connection}
            />
          </div>
        )}

        <div className={styles.infoSection}>
          <StatusBadges
            connected={connected}
            connection={connection}
            charging={charging}
          />
          {connected && <ColorPicker />}
        </div>
      </div>

      {/* Modals */}
      <DeviceInfoModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        status={status}
      />

      <AppreciationModal
        open={appreciationOpen}
        onClose={() => setAppreciationOpen(false)}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        showAppreciationIcon={showAppreciationIcon}
        setShowAppreciationIcon={setShowAppreciationIcon}
        updater={updater}
      />

      <UpdateReadyModal
        status={updater.status}
        updateVersion={updater.updateVersion}
        showInstallModal={updater.showInstallModal}
        installNow={updater.installNow}
        installLater={updater.installLater}
      />
    </main>
  );
}

export default App;

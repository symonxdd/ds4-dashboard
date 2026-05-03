import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Settings as SettingsIcon, Info as InfoIcon, Sun, Moon } from "lucide-react";

// Components
import Gauge from "./components/Gauge";
import StatusBadges from "./components/StatusBadges";
import Settings from "./components/Settings";
import DeviceInfoModal from "./components/DeviceInfoModal";
import ColorPicker from "./components/ColorPicker";
import { useTheme } from "./context/ThemeContext";

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
  const { theme, toggleTheme } = useTheme();

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
  }, []);

  const { connected, connection, battery, charging } = status;

  return (
    <main className={styles.dashboard}>
      {/* Theme Toggle (Left) */}
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

      <div className={styles.content}>
        <div className={styles.gaugeSection}>
          <Gauge 
            battery={battery} 
            charging={charging} 
            connected={connected} 
            connection={connection}
          />
        </div>

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

      <Settings 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </main>
  );
}

export default App;

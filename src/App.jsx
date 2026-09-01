import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Settings as SettingsIcon, Info as InfoIcon, Sun, Moon, Heart } from "lucide-react";

// Components
import Gauge from "./components/Gauge";
import ControllerCard from "./components/ControllerCard";
import StatusBadges from "./components/StatusBadges";
import SettingsModal from "./components/SettingsModal";
import DeviceInfoModal from "./components/DeviceInfoModal";
import AppreciationModal from "./components/AppreciationModal";
import UpdateReadyModal from "./components/UpdateReadyModal";
import ColorPicker from "./components/ColorPicker";
import { useTheme } from "./context/ThemeContext";
import { useUpdater } from "./hooks/useUpdater";
import { loadSettings, toOutput } from "./lib/lightbar";

// Styles
import styles from "./App.module.css";

const SELECTED_CONTROLLER_KEY = "selected_controller";

function App() {
  const [controllers, setControllers] = useState([]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [appreciationOpen, setAppreciationOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const updater = useUpdater();

  const remembered = useRef(localStorage.getItem(SELECTED_CONTROLLER_KEY));
  const lightbarSynced = useRef(new Set());

  const [showAppreciationIcon, setShowAppreciationIcon] = useState(() => {
    const saved = localStorage.getItem("show_appreciation_icon");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("show_appreciation_icon", showAppreciationIcon);
  }, [showAppreciationIcon]);

  useEffect(() => {
    // 1. Initial fetch, for controllers that were already connected at launch
    invoke("get_controllers").then(setControllers).catch(console.error);

    // 2. Listen for real-time updates from Rust
    const unlisten = listen("ds4-controllers-update", (event) => {
      setControllers(event.payload);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Rust picks the first controller it sees; restore the user's own choice as
  // soon as that one shows up.
  useEffect(() => {
    const choice = controllers.find(({ id }) => id === remembered.current);

    if (choice && !choice.selected) {
      invoke("select_controller", { id: choice.id }).catch(console.error);
    }
  }, [controllers]);

  // Rust re-applies a controller's color itself while the app is running, so
  // this only has to cover controllers first seen in this session.
  useEffect(() => {
    for (const { id } of controllers) {
      if (lightbarSynced.current.has(id)) continue;
      lightbarSynced.current.add(id);

      invoke("set_output_state", toOutput(id, loadSettings(id))).catch(console.error);
    }
  }, [controllers]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      getCurrentWindow().setTitle("DS4 Dashboard (dev)");
    }

    // Initial sync of app icon
    const savedIcon = localStorage.getItem("app_icon");
    if (savedIcon) {
      invoke("set_app_icon", { id: savedIcon }).catch(() => {});
    }
  }, []);

  const selectController = (id) => {
    remembered.current = id;
    localStorage.setItem(SELECTED_CONTROLLER_KEY, id);
    invoke("select_controller", { id }).catch(console.error);
  };

  const selected = controllers.find(({ selected }) => selected) ?? null;
  const showGrid = controllers.length > 1;

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

      <div className={`${styles.content} ${controllers.length === 0 ? styles.contentEmpty : ""} ${showGrid ? styles.contentGrid : ""}`}>
        {showGrid ? (
          <div className={styles.grid}>
            {controllers.map((controller) => (
              <ControllerCard
                key={controller.id}
                controller={controller}
                onSelect={() => selectController(controller.id)}
              />
            ))}
          </div>
        ) : (
          selected && (
            <div className={styles.gaugeSection}>
              <Gauge
                battery={selected.battery}
                charging={selected.charging}
                connected
                connection={selected.connection}
              />
            </div>
          )
        )}

        <div className={styles.infoSection}>
          <StatusBadges connected={controllers.length > 0} />
          {selected && <ColorPicker controllerId={selected.id} />}
        </div>
      </div>

      {/* Modals */}
      <DeviceInfoModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        controller={selected}
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

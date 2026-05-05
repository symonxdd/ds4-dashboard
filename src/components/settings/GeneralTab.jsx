import SettingItem, { Toggle } from "./SettingItem";
import styles from "./GeneralTab.module.css";

export default function GeneralTab({
  autostartEnabled,
  handleAutostartToggle,
  appIcon,
  setAppIcon,
  startMinimized,
  setStartMinimized
}) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.group}>
        <label className={styles.label}>Appearance</label>

        <SettingItem
          title="App Icon"
          description="Choose your preferred icon style"
        >
          <div className={styles.iconSelector}>
            <div
              className={`${styles.iconOption} ${appIcon === "default" ? styles.active : ""}`}
              onClick={() => setAppIcon("default")}
              data-tooltip="Classic Gamepad"
            >
              <img src="/app-icon.svg" alt="Default" />
            </div>
            <div
              className={`${styles.iconOption} ${appIcon === "alt" ? styles.active : ""}`}
              onClick={() => setAppIcon("alt")}
              data-tooltip="Modern Controller"
            >
              <img src="/alt-icons/app-icon-alt.svg" alt="Alt" />
            </div>
            <div 
              className={`${styles.iconOption} ${appIcon === "alt2" ? styles.active : ""}`}
              onClick={() => setAppIcon("alt2")}
              data-tooltip="Classic Gamepad"
            >
              <img src="/alt-icons/app-icon-alt2.svg" alt="Alt 2" />
            </div>
          </div>
        </SettingItem>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Application</label>

        <SettingItem
          title="Start with Windows"
          description="Automatically run the dashboard when you log in"
        >
          <Toggle
            checked={autostartEnabled}
            onChange={handleAutostartToggle}
          />
        </SettingItem>

        <div className={`${styles.dependentSetting} ${!autostartEnabled ? styles.disabled : ""}`}>
          <SettingItem
            title="Start Minimized"
            description="Hide dashboard in system tray on auto-launch"
          >
            <Toggle
              checked={startMinimized}
              onChange={(e) => autostartEnabled && setStartMinimized(e.target.checked)}
              disabled={!autostartEnabled}
            />
          </SettingItem>
        </div>
      </div>
    </div>
  );
}

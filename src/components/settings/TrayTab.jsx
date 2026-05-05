import SettingItem, { Toggle } from "./SettingItem";
import styles from "./TrayTab.module.css";

export default function TrayTab({
  trayVisible,
  setTrayVisible,
  closeToTray,
  setCloseToTray,
  invoke
}) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.group}>
        <label className={styles.label}>Tray Behavior</label>
        
        <SettingItem 
          title="Show Tray Icon" 
          description="Keep the dashboard running in the system tray"
        >
          <Toggle 
            checked={trayVisible} 
            onChange={(e) => {
              const val = e.target.checked;
              setTrayVisible(val);
              localStorage.setItem("tray_visible", val.toString());
              
              if (!val) {
                setCloseToTray(false);
                localStorage.setItem("close_to_tray", "false");
                invoke("toggle_close_to_tray", { enabled: false }).catch(console.error);
              }
            }} 
          />
        </SettingItem>

        <SettingItem 
          title="Minimize to Tray" 
          description="Keep the app running in the background when closed"
          disabled={!trayVisible}
        >
          <Toggle 
            checked={closeToTray} 
            disabled={!trayVisible}
            onChange={(e) => {
              const val = e.target.checked;
              setCloseToTray(val);
              localStorage.setItem("close_to_tray", val.toString());
            }} 
          />
        </SettingItem>
      </div>

      <div className={styles.group}>
        <div className={styles.infoBox}>
          The tray icon is currently set to <b>Gauge Style</b>. More options coming soon.
        </div>
      </div>
    </div>
  );
}

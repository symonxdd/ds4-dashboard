import SettingItem, { Toggle } from "./SettingItem";
import styles from "./EmulationTab.module.css";

export default function EmulationTab({
  mouseEmulation,
  setMouseEmulation,
  stickEmulation,
  setStickEmulation
}) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.group}>
        <label className={styles.label}>
          Emulation <span className={styles.experimentalBadge}>Experimental</span>
        </label>
        
        <SettingItem 
          title="Touchpad Mouse" 
          description="Use DS4 touchpad to move the mouse cursor"
        >
          <Toggle 
            checked={mouseEmulation} 
            onChange={(e) => {
              const val = e.target.checked;
              setMouseEmulation(val);
              localStorage.setItem("mouse_emulation", val.toString());
            }} 
          />
        </SettingItem>

        <SettingItem 
          title="Joystick Mouse" 
          description="Use right stick to move the mouse cursor"
        >
          <Toggle 
            checked={stickEmulation} 
            onChange={(e) => {
              const val = e.target.checked;
              setStickEmulation(val);
              localStorage.setItem("stick_emulation", val.toString());
            }} 
          />
        </SettingItem>
      </div>
      
      <div className={styles.group}>
        <div className={styles.infoBox}>
          Input emulation works by capturing raw DS4 data and translating it to OS-level mouse events.
        </div>
      </div>
    </div>
  );
}

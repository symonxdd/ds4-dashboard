import { Settings, Monitor, Gamepad2, Info } from "lucide-react";
import styles from "./TabNav.module.css";

export default function TabNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "tray", label: "Tray", icon: Monitor },
    { id: "emulation", label: "Emulation", icon: Gamepad2 },
    { id: "about", label: "About", icon: Info }
  ];

  return (
    <div className={styles.tabNav}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={14} className={styles.tabIcon} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}


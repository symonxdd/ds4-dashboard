import styles from "./SettingItem.module.css";

export default function SettingItem({ title, description, children, disabled, vertical }) {
  return (
    <div className={`${styles.settingItem} ${disabled ? styles.disabled : ""} ${vertical ? styles.vertical : ""}`}>
      <div className={styles.settingLabel}>
        <span className={styles.settingTitle}>{title}</span>
        {description && <span className={styles.settingDesc}>{description}</span>}
      </div>
      <div className={styles.settingControl}>
        {children}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, disabled }) {
  return (
    <label className={styles.switch}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={styles.slider}></span>
    </label>
  );
}

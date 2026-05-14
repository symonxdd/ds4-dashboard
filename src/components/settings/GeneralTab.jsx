import { useState, useEffect } from "react";
import SettingItem, { Toggle } from "./SettingItem";
import styles from "./GeneralTab.module.css";
import { ICON_REGISTRY, getIconById, getActiveVariant } from "../../constants/icons";

export default function GeneralTab({
  autostartEnabled,
  handleAutostartToggle,
  appIcon,
  setAppIcon,
  startMinimized,
  setStartMinimized
}) {
  const selectedIcon = getIconById(appIcon);
  const activeVariant = getActiveVariant(selectedIcon, appIcon);
  
  // Memory for last selected variant per icon
  const [variantMemory, setVariantMemory] = useState(() => {
    const saved = localStorage.getItem("icon_variant_memory");
    return saved ? JSON.parse(saved) : {};
  });

  // Persist memory changes
  useEffect(() => {
    localStorage.setItem("icon_variant_memory", JSON.stringify(variantMemory));
  }, [variantMemory]);

  const handleIconSelect = (iconId) => {
    // Check if we have a remembered variant for this icon
    const rememberedVariantId = variantMemory[iconId];
    
    if (rememberedVariantId) {
      // Re-apply the logic from handleVariantSelect
      const icon = ICON_REGISTRY.find(i => i.id === iconId);
      if (icon.variants && icon.variants[0].id === rememberedVariantId) {
        setAppIcon(iconId);
      } else {
        setAppIcon(`${iconId}_${rememberedVariantId}`);
      }
    } else {
      setAppIcon(iconId);
    }
  };

  const handleVariantSelect = (iconId, variantId) => {
    // Update memory
    setVariantMemory(prev => ({
      ...prev,
      [iconId]: variantId
    }));

    // If the variant is 'wired' (the first one), we use the base ID to keep filename clean
    const icon = ICON_REGISTRY.find(i => i.id === iconId);
    if (icon.variants && icon.variants[0].id === variantId) {
      setAppIcon(iconId);
    } else {
      setAppIcon(`${iconId}_${variantId}`);
    }
  };

  const dynamicStatus = `${selectedIcon.label}${activeVariant ? ` (${activeVariant.label})` : ""}`;

  return (
    <div className={styles.tabContent}>
      {/* Appearance Section - Now First */}
      <div className={styles.group}>
        <label className={styles.label}>Appearance</label>

        <SettingItem
          title="App Icon"
          description="Choose your preferred icon style"
          vertical
        >
          <div className={styles.iconSelector}>
            {ICON_REGISTRY.map((icon) => {
              const isActive = selectedIcon.id === icon.id;
              
              // Determine which variant to show in the grid
              const rememberedVariantId = variantMemory[icon.id];
              let currentIconPath = icon.path;
              
              if (icon.variants) {
                const variantToShow = isActive 
                  ? activeVariant 
                  : (icon.variants.find(v => v.id === rememberedVariantId) || icon.variants[0]);
                currentIconPath = variantToShow.path;
              }

              return (
                <div
                  key={icon.id}
                  className={`${styles.iconOption} ${isActive ? styles.active : ""}`}
                  onClick={() => handleIconSelect(icon.id)}
                  data-tooltip={icon.label}
                >
                  <img src={currentIconPath} alt={icon.label} />

                  {icon.variants && (
                    <div className={styles.variantOverlay}>
                      {icon.variants.map((v) => (
                        <div
                          key={v.id}
                          className={`${styles.miniVariant} ${isActive && activeVariant.id === v.id ? styles.miniActive : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVariantSelect(icon.id, v.id);
                          }}
                        >
                          <img src={v.path} alt={v.label} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className={styles.iconStatus}>
            <span className={styles.statusPrefix}>Current Icon:</span>
            <span className={styles.statusName}>{dynamicStatus}</span>
          </div>
        </SettingItem>
      </div>

      {/* Application Section - Now Second */}
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

        {autostartEnabled && (
          <div className={styles.subSettingRow}>
            <div className={styles.subSettingLabel}>
              <span className={styles.subSettingTitle}>Launch Minimized</span>
              <span className={styles.subSettingDesc}>Automatically hide to system tray on Windows startup</span>
            </div>
            <Toggle
              checked={startMinimized}
              onChange={(e) => setStartMinimized(e.target.checked)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

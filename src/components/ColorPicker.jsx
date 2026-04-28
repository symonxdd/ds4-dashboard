import { useState, useRef, useEffect } from "react";
import styles from "./ColorPicker.module.css";
import { invoke } from "@tauri-apps/api/core";
import { ChevronDown, ChevronUp } from "lucide-react";

const PRESETS = [
  { name: "PS Blue", hex: "#0037FF", r: 0, g: 55, b: 255 },
  { name: "Soft Red", hex: "#FF0033", r: 255, g: 0, b: 51 },
  { name: "Green", hex: "#00FF44", r: 0, g: 255, b: 68 },
  { name: "Pink", hex: "#FF00FF", r: 255, g: 0, b: 255 },
  { name: "Amber", hex: "#FF8800", r: 255, g: 136, b: 0 },
  { name: "Pure White", hex: "#FFFFFF", r: 255, g: 255, b: 255 },
];

export default function ColorPicker() {
  const [rgb, setRgb] = useState({ r: 0, g: 55, b: 255 });
  const [rumble, setRumble] = useState({ weak: 0, strong: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  
  const pendingUpdate = useRef(null);
  const isProcessing = useRef(false);

  const requestUpdate = (newRgb, newRumble) => {
    pendingUpdate.current = { newRgb, newRumble };
    if (!isProcessing.current) {
      processQueue();
    }
  };

  const processQueue = async () => {
    if (!pendingUpdate.current) return;
    
    isProcessing.current = true;
    const { newRgb, newRumble } = pendingUpdate.current;
    pendingUpdate.current = null;

    try {
      // NOTE: Using snake_case keys to match Rust function arguments
      await invoke("set_output_state", {
        r: newRgb.r,
        g: newRgb.g,
        b: newRgb.b,
        smallRumble: newRumble.weak,
        largeRumble: newRumble.strong,
      });
    } catch (err) {
      console.error("Failed to update controller state:", err);
    }

    // Use a small delay to prevent flooding, but keep it responsive
    setTimeout(() => {
      isProcessing.current = false;
      if (pendingUpdate.current) {
        processQueue();
      }
    }, 10); 
  };

  const handleRgbChange = (channel, value) => {
    const val = parseInt(value);
    const newRgb = { ...rgb, [channel]: val };
    setRgb(newRgb);
    requestUpdate(newRgb, rumble);
  };

  const handleRumbleChange = (type, value) => {
    const val = parseInt(value);
    const newRumble = { ...rumble, [type]: val };
    setRumble(newRumble);
    requestUpdate(rgb, newRumble);
  };

  const handlePresetSelect = (preset) => {
    const newRgb = { r: preset.r, g: preset.g, b: preset.b };
    setRgb(newRgb);
    requestUpdate(newRgb, rumble);
  };

  return (
    <div className={`${styles.container} ${isExpanded ? styles.expanded : ""}`}>
      <button 
        className={styles.expandHeader} 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={styles.sectionTitle}>Lightbar & Rumble</span>
        <div className={styles.headerRight}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      <div className={styles.contentWrapper}>
        <div className={styles.innerContent}>
          <section className={styles.section}>
            <h4 className={styles.subTitle}>Lightbar Color</h4>
            <div className={styles.sliders}>
              {["r", "g", "b"].map((channel) => (
                <div key={channel} className={styles.sliderGroup}>
                  <div className={styles.sliderHeader}>
                    <span className={styles.label}>{channel.toUpperCase()}</span>
                    <span className={styles.value}>{rgb[channel]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgb[channel]}
                    onChange={(e) => handleRgbChange(channel, e.target.value)}
                    className={styles.slider}
                  />
                </div>
              ))}
            </div>
            
            <div className={styles.presets}>
              {PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  className={`${styles.colorDot} ${
                    rgb.r === preset.r && rgb.g === preset.g && rgb.b === preset.b 
                    ? styles.active : ""
                  }`}
                  style={{ "--color": preset.hex }}
                  onClick={() => handlePresetSelect(preset)}
                  title={preset.name}
                />
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h4 className={styles.subTitle}>Rumble</h4>
            <div className={styles.sliders}>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <span className={styles.label}>Weak</span>
                  <span className={styles.value}>{rumble.weak}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rumble.weak}
                  onChange={(e) => handleRumbleChange("weak", e.target.value)}
                  className={styles.slider}
                />
              </div>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <span className={styles.label}>Strong</span>
                  <span className={styles.value}>{rumble.strong}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rumble.strong}
                  onChange={(e) => handleRumbleChange("strong", e.target.value)}
                  className={styles.slider}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

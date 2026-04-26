import { useState } from "react";
import styles from "./ColorPicker.module.css";
import { invoke } from "@tauri-apps/api/core";

const PRESETS = [
  { name: "PS Blue", hex: "#0037FF", r: 0, g: 55, b: 255 },
  { name: "Soft Red", hex: "#FF0033", r: 255, g: 0, b: 51 },
  { name: "Green", hex: "#00FF44", r: 0, g: 255, b: 68 },
  { name: "Pink", hex: "#FF00FF", r: 255, g: 0, b: 255 },
  { name: "Amber", hex: "#FF8800", r: 255, g: 136, b: 0 },
  { name: "Pure White", hex: "#FFFFFF", r: 255, g: 255, b: 255 },
];

export default function ColorPicker() {
  const [activeColor, setActiveColor] = useState(PRESETS[0].hex);

  const handleColorSelect = async (color) => {
    setActiveColor(color.hex);
    try {
      await invoke("set_lightbar", { r: color.r, g: color.g, b: color.b });
    } catch (err) {
      console.error("Failed to set lightbar color:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.presets}>
        {PRESETS.map((color) => (
          <button
            key={color.hex}
            className={`${styles.colorDot} ${
              activeColor === color.hex ? styles.active : ""
            }`}
            style={{ "--color": color.hex }}
            onClick={() => handleColorSelect(color)}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );
}

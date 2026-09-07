import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import Collapsible from "./Collapsible";
import styles from "./ColorPicker.module.css";
import { NO_RUMBLE, loadSettings, saveSettings, toOutput } from "../lib/lightbar";

const PRESETS = [
  { name: "PS Blue", hex: "#0037FF", r: 0, g: 55, b: 255 },
  { name: "Soft Red", hex: "#FF0033", r: 255, g: 0, b: 51 },
  { name: "Green", hex: "#00FF44", r: 0, g: 255, b: 68 },
  { name: "Pink", hex: "#FF00FF", r: 255, g: 0, b: 255 },
  { name: "Amber", hex: "#FF8800", r: 255, g: 136, b: 0 },
  { name: "Pure White", hex: "#FFFFFF", r: 255, g: 255, b: 255 },
];

// Lightbar and rumble are two tiles but one piece of state, because the
// controller takes color and rumble in a single output report.
export default function ColorPicker({ controllerId }) {
  const [settings, setSettings] = useState(() => loadSettings(controllerId));
  const [rumble, setRumble] = useState(NO_RUMBLE);

  const { rgb, brightness } = settings;

  useEffect(() => {
    setSettings(loadSettings(controllerId));
    setRumble(NO_RUMBLE);

    // Rumble is a preview, not a setting, so it must not outlive the panel:
    // without this, switching controllers would leave the old one buzzing.
    return () => {
      invoke("set_output_state", toOutput(controllerId, loadSettings(controllerId)))
        .catch(console.error);
    };
  }, [controllerId]);

  const apply = (nextSettings, nextRumble) => {
    setSettings(nextSettings);
    setRumble(nextRumble);
    saveSettings(controllerId, nextSettings);

    invoke("set_output_state", toOutput(controllerId, nextSettings, nextRumble))
      .catch(console.error);
  };

  const handleRgbChange = (channel, value) => {
    apply({ ...settings, rgb: { ...rgb, [channel]: parseInt(value) } }, rumble);
  };

  const handleBrightnessChange = (value) => {
    apply({ ...settings, brightness: parseInt(value) }, rumble);
  };

  const handlePresetSelect = (preset) => {
    apply({ ...settings, rgb: { r: preset.r, g: preset.g, b: preset.b } }, rumble);
  };

  const handleRumbleChange = (motor, value) => {
    apply(settings, { ...rumble, [motor]: parseInt(value) });
  };

  return (
    <div className={styles.stack}>
      <Collapsible title="Lightbar" maxHeight={520}>
        <div className={styles.presetsRow}>
          <h4 className={styles.subTitle}>Presets</h4>
          <div className={styles.presets}>
            {PRESETS.map((preset) => (
              <button
                key={preset.hex}
                className={`${styles.colorDot} ${rgb.r === preset.r && rgb.g === preset.g && rgb.b === preset.b
                    ? styles.active : ""
                  }`}
                style={{ "--color": preset.hex }}
                onClick={() => handlePresetSelect(preset)}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        <div className={styles.rowDivider} />

        <div className={styles.topRow}>
          <section className={styles.colorSection}>
            <h4 className={styles.subTitle}>Color</h4>
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
          </section>

          <section className={styles.brightnessSection}>
            <h4 className={styles.subTitle}>Brightness</h4>
            <div className={styles.sliderGroup}>
              <div className={styles.sliderHeader}>
                <span className={styles.label}>Intensity</span>
                <span className={styles.value}>{brightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={brightness}
                onChange={(e) => handleBrightnessChange(e.target.value)}
                className={styles.slider}
              />
            </div>
          </section>
        </div>

        <p className={styles.footerNote}>
          Color and brightness are saved per controller and re-applied when it connects.
        </p>
      </Collapsible>

      <Collapsible title="Rumble" maxHeight={200}>
        <div className={styles.rumbleSliders}>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderHeader}>
              <span className={styles.label}>Weak Motor</span>
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
              <span className={styles.label}>Strong Motor</span>
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

        <p className={styles.footerNote}>
          Rumble is only for testing and isn't saved.
        </p>
      </Collapsible>
    </div>
  );
}

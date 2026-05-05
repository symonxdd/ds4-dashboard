import { openUrl } from "@tauri-apps/plugin-opener";
import styles from "./AboutTab.module.css";

export default function AboutTab({ appIcon }) {
  const getIconData = () => {
    switch (appIcon) {
      case "alt":
        return {
          path: "/alt-icons/app-icon-alt.svg",
          author: "Sunbzy (SVG Repo)",
          link: "https://www.svgrepo.com/svg/426185/gamepad-controller",
          glowClass: styles.altIcon
        };
      case "alt2":
        return {
          path: "/alt-icons/app-icon-alt2.svg",
          author: "SVG Repo",
          link: "https://www.svgrepo.com/svg/276254/gamepad-joystick",
          glowClass: styles.alt2Icon
        };
      default:
        return {
          path: "/app-icon.svg",
          author: "SVG Repo",
          link: "https://www.svgrepo.com/svg/276254/gamepad-joystick",
          glowClass: ""
        };
    }
  };

  const iconData = getIconData();

  return (
    <div className={styles.aboutContainer}>
      <div className={styles.aboutHeader}>
        <img
          src={iconData.path}
          alt="App Icon"
          className={`${styles.aboutIcon} ${iconData.glowClass}`}
        />
        <div className={styles.aboutInfo}>
          <h1 className={styles.appName}>DS4 Dashboard</h1>
          <p className={styles.appCredits}>A Symon Software Experience</p>
        </div>
      </div>

      <div className={styles.aboutSection}>
        <h2 className={styles.sectionTitle}>Attributions</h2>

        <div className={styles.attributionItem}>
          <div className={styles.attributionLabel}>HID Logic</div>
          <div className={styles.attributionContent}>
            Inspired by <span className={styles.link} onClick={() => openUrl("https://github.com/TheBITLINK/WebHID-DS4")}>WebHID-DS4</span>
          </div>
        </div>

        <div className={styles.attributionItem}>
          <div className={styles.attributionLabel}>App Icon</div>
          <div className={styles.attributionContent}>
            Designed by <span className={styles.link} onClick={() => openUrl(iconData.link)}>
              {iconData.author}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.aboutFooter}>
        <span className={styles.tooltipContainer}>
          Fastidiously
          <span className={styles.tooltip}>
            <div className={styles.tooltipDefinition}>(adverb) — done with very careful attention to detail; extremely precise</div>
            <div className={styles.tooltipSynonyms}>
              Synonyms: carefully, precisely
            </div>
          </span>
        </span> engineered with 🥰 by Symon for the DS4 community
      </div>
    </div>
  );
}

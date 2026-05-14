import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { openUrl } from "@tauri-apps/plugin-opener";
import { SiGithub } from "react-icons/si";
import styles from "./AboutTab.module.css";
import { getIconById, getActiveVariant } from "../../constants/icons";

export default function AboutTab({
  appIcon,
  currentVersion,
  remoteVersion,
  updateAvailable,
  repoUrl,
  env
}) {
  const icon = getIconById(appIcon);
  const variant = getActiveVariant(icon, appIcon);
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const iconPath = variant ? variant.path : icon.path;

  const handleRelease = async () => {
    setIsDragging(false);
    setIsBusy(true);
    
    // Trigger the "ping" animation on release
    await controls.start({
      scale: [1, 2.5],
      opacity: [0.6, 0],
      transition: { duration: 0.4, ease: "easeOut" }
    });
    // Reset the ring
    controls.set({ scale: 0, opacity: 0 });
    
    // Keep it "busy" for a bit while it springs back
    setTimeout(() => setIsBusy(false), 600);
  };

  return (
    <div className={styles.aboutContainer}>
      <div className={styles.aboutHeader}>
        <div className={styles.iconWrapper}>
          <motion.div
            className={styles.releaseRing}
            animate={controls}
            initial={{ scale: 0, opacity: 0 }}
          />
          <motion.img
            src={iconPath}
            alt={icon.label}
            className={`${styles.aboutIcon} ${isDragging ? styles.dragging : ""} ${isBusy ? styles.busy : ""}`}
            style={{ 
              "--glow-color": icon.glow,
              willChange: "transform, filter",
              transformStyle: "preserve-3d"
            }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.6}
            onPointerDown={() => setIsDragging(true)}
            onDragEnd={handleRelease}
            onTap={handleRelease}
            whileTap={{ 
              scale: 1.1,
              rotate: 10,
              filter: `drop-shadow(0 25px 40px ${icon.glow || 'rgba(237, 85, 100, 0.5)'})`
            }}
            whileHover={{
              scale: 1.15,
              translateY: -12,
              rotateX: 10,
              rotateY: -5,
              transition: { type: "spring", stiffness: 400, damping: 15 }
            }}
          />
        </div>
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
            Designed by <span className={styles.link} onClick={() => openUrl(icon.link)}>
              {icon.author}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.footerText}>
          DS4 Dashboard v{currentVersion ?? "…"} ({env}{remoteVersion && currentVersion && (
            <>
              {", "}
              <span
                className={updateAvailable ? styles.updateLink : styles.latestText}
                data-tooltip={updateAvailable ? "A new version is available on GitHub" : "You are using the latest version"}
                onClick={async () => {
                  if (updateAvailable) {
                    await openUrl(`${repoUrl}/releases/latest`);
                  }
                }}
              >
                {updateAvailable ? "update available" : "latest"}
              </span>
            </>
          )})
        </span>
        <button
          className={styles.githubBtn}
          onClick={() => openUrl(repoUrl)}
          aria-label="View source"
          data-tooltip="View source"
        >
          <SiGithub size={14} />
        </button>
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

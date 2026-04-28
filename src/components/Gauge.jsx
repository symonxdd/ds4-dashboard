import { Battery, Zap, Bluetooth, Usb } from "lucide-react";
import styles from "./Gauge.module.css";

const ARC_DEGREES = 240;
const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_LENGTH = CIRCUMFERENCE * (ARC_DEGREES / 360);

function getColor(battery, charging) {
  if (charging) return "#38bdf8"; // sky blue when charging
  if (battery > 70) return "#22c55e"; // green
  if (battery > 30) return "#eab308"; // yellow
  return "#ef4444"; // red
}

export default function Gauge({ battery, charging, connected, connection }) {
  const color = getColor(battery, charging);
  const isBT = connection === "Bluetooth";

  // Calculate how much of the arc to fill
  const fillLength = connected ? ARC_LENGTH * (battery / 100) : 0;
  const dashOffset = ARC_LENGTH - fillLength;

  return (
    <div className={styles.wrapper}>
      
      <svg viewBox="0 0 180 140" className={styles.svg}>
        {/* Background arc */}
        <circle
          className={styles.bg}
          cx="90"
          cy="90"
          r={RADIUS}
          strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
          strokeDashoffset="0"
        />
        {/* Filled arc */}
        <circle
          className={styles.fill}
          cx="90"
          cy="90"
          r={RADIUS}
          stroke={color}
          strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
        />
      </svg>

      {/* Center text */}
      <div className={styles.center}>
        {connected ? (
          <>
            <div className={`${styles.iconContainer} ${styles.topIconContainer}`} data-tooltip="The controller's battery level">
              <Battery size={20} className={styles.topIcon} style={{ color }} />
            </div>
            <span className={styles.batteryValue} style={{ color }}>
              {battery}
            </span>
            <div className={styles.iconsRow}>
              <div className={styles.iconContainer} data-tooltip={isBT ? "Connected via Bluetooth" : "Connected via USB"}>
                {isBT ? <Bluetooth size={16} className={styles.connIcon} /> : <Usb size={16} className={styles.connIcon} />}
              </div>
              
              {charging && (
                <div className={styles.iconContainer} data-tooltip="Controller is charging">
                  <div className={styles.ripple} />
                  <Zap size={18} className={styles.chargingIcon} />
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

// The gauge arc spans 240° of a circle.
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

function App() {
  const [status, setStatus] = useState({
    connected: false,
    connection: null,
    battery: 0,
    charging: false,
  });

  useEffect(() => {
    // Initial fetch
    invoke("get_ds4_status").then(setStatus).catch(console.error);

    // Listen for real-time updates from the Rust backend
    const unlisten = listen("ds4-status-update", (event) => {
      setStatus(event.payload);
    });

    // Also poll as backup every 3 seconds
    const interval = setInterval(() => {
      invoke("get_ds4_status").then(setStatus).catch(console.error);
    }, 3000);

    return () => {
      unlisten.then((fn) => fn());
      clearInterval(interval);
    };
  }, []);

  const { connected, connection, battery, charging } = status;
  const color = getColor(battery, charging);

  // Calculate how much of the arc to fill
  const fillLength = connected ? ARC_LENGTH * (battery / 100) : 0;
  const dashOffset = ARC_LENGTH - fillLength;

  // Connection label
  const connLabel =
    connection === "Usb" ? "USB" : connection === "Bluetooth" ? "BT" : "—";

  return (
    <main className="dashboard">
      <div className="gauge-card">
        {/* Gauge */}
        <div className="gauge-wrapper">
          <svg viewBox="0 0 180 140" className="gauge-svg">
            {/* Background arc */}
            <circle
              className="gauge-bg"
              cx="90"
              cy="90"
              r={RADIUS}
              strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
              strokeDashoffset="0"
            />
            {/* Filled arc */}
            <circle
              className="gauge-fill"
              cx="90"
              cy="90"
              r={RADIUS}
              stroke={color}
              strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE}`}
              strokeDashoffset={dashOffset}
            />
          </svg>

          {/* Center text */}
          <div className="gauge-center">
            {connected ? (
              <>
                <span className="gauge-pct" style={{ color }}>
                  {battery}
                </span>
                <span className="gauge-pct-sign" style={{ color }}>
                  %
                </span>
              </>
            ) : (
              <span className="gauge-disconnected">—</span>
            )}
          </div>
        </div>

        {/* Status badges */}
        <div className="badges">
          {connected ? (
            <>
              <span className={`badge badge-conn ${connection === "Bluetooth" ? "bt" : "usb"}`}>
                {connection === "Bluetooth" ? "🔷" : "🔌"} {connLabel}
              </span>
              {charging && (
                <span className="badge badge-charging">⚡ Charging</span>
              )}
            </>
          ) : (
            <span className="badge badge-disconnected">No Controller</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="footer-text">DualShock 4</p>
    </main>
  );
}

export default App;

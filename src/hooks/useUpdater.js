import { useCallback, useEffect, useRef, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { check } from "@tauri-apps/plugin-updater";

const REPO_URL = "https://github.com/symonxdd/ds4-dashboard";

/**
 * Drives the whole update lifecycle for the app's current process lifetime.
 *
 * This hook is meant to be instantiated once, at the App root, so its state
 * (in particular `update`, the downloaded-but-not-yet-installed handle) lives
 * exactly as long as the process does. Hiding/showing the window to the tray
 * never remounts this hook, so an in-progress or completed download is never
 * lost or re-checked just from that, only a real process restart resets it,
 * which is the desired behavior (see CLAUDE.md-adjacent spec: minimize-to-tray
 * must not affect update state, a full quit+relaunch must).
 */
export function useUpdater() {
  const [currentVersion, setCurrentVersion] = useState(null);
  // idle -> available -> downloading -> downloaded -> installing
  // "installing" is transient/best-effort: on Windows, install() tears down
  // this whole process to replace the running .exe (a Windows installer
  // limitation, not a Tauri choice), so there's no reachable "installed"
  // state to observe from here, since NSIS itself relaunches the app afterward.
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState({ downloaded: 0, total: null });
  const [error, setError] = useState(null);
  // Only ever set to true as the direct, synchronous result of a download
  // finishing live in this session, never on startup or a background check.
  const [showInstallModal, setShowInstallModal] = useState(false);

  const updateRef = useRef(null);

  useEffect(() => {
    getVersion().then(setCurrentVersion);

    // Quiet background metadata check: on startup, and on relaunch after a
    // full quit (this effect only ever runs once per process lifetime,
    // since the window is hidden/shown, never remounted, for the tray case).
    check()
      .then((result) => {
        if (result) {
          updateRef.current = result;
          setStatus("available");
        }
      })
      .catch((err) => {
        console.error("Update check failed:", err);
      });
  }, []);

  const downloadUpdate = useCallback(async () => {
    const update = updateRef.current;
    if (!update || status === "downloading") return;

    setError(null);
    setStatus("downloading");
    setProgress({ downloaded: 0, total: null });

    try {
      let downloaded = 0;
      await update.download((event) => {
        switch (event.event) {
          case "Started":
            setProgress({ downloaded: 0, total: event.data.contentLength ?? null });
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            setProgress((prev) => ({ ...prev, downloaded }));
            break;
          case "Finished":
            break;
        }
      });

      // Download finished live, in front of the user right now: this is the
      // one and only trigger for the install-ready modal.
      setStatus("downloaded");
      setShowInstallModal(true);
    } catch (err) {
      console.error("Update download failed:", err);
      setError(String(err));
      setStatus("available");
    }
  }, [status]);

  const installNow = useCallback(async () => {
    const update = updateRef.current;
    if (!update) return;

    setShowInstallModal(false);
    setStatus("installing");
    setError(null);

    try {
      // On success this process is killed by Windows before install()
      // resolves, so nothing after this line normally runs.
      await update.install();
    } catch (err) {
      console.error("Update install failed:", err);
      setError(String(err));
      setStatus("downloaded");
    }
  }, []);

  const installLater = useCallback(() => {
    // Update stays downloaded in memory; About tab now offers "Install"
    // directly instead of "Download" since re-downloading isn't needed.
    setShowInstallModal(false);
  }, []);

  return {
    currentVersion,
    updateVersion: updateRef.current?.version ?? null,
    updateNotes: updateRef.current?.body ?? null,
    status,
    progress,
    error,
    showInstallModal,
    repoUrl: REPO_URL,
    downloadUpdate,
    installNow,
    installLater,
  };
}

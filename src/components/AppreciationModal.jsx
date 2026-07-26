import { openUrl } from "@tauri-apps/plugin-opener";
import Modal from "./Modal";
import styles from "./AppreciationModal.module.css";

const REPO_URL = "https://github.com/symonxdd/ds4-dashboard";
const COFFEE_URL = "https://buymeacoffee.com/symonxd";

export default function AppreciationModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Thanks for using DS4 Dashboard">
      <div className={styles.body}>
        <p>
          This app is free and maintained in my spare time. If it's been useful to you, the single biggest thing you can do to help is <strong>starring the repo on GitHub</strong>.
        </p>
        <p>
          Starring bookmarks the project to your own GitHub account and adds to its public star count, the main signal most people (and GitHub itself) use to judge whether an open-source tool is worth trusting and trying.
        </p>
        <p>
          It is also genuinely motivating to see another star appear. Knowing that something I built for myself is proving useful to others is one of the most rewarding parts of working on this or any other personal project.
        </p>
        <p>
          Want to support it financially instead (or as well)? I have a{" "}
          <span className={styles.link} onClick={() => openUrl(COFFEE_URL)}>
            Buy Me a Coffee page
          </span>.
        </p>
        <p className={styles.footnote}>
          This icon can be hidden any time from Settings → General → "Show Appreciation Icon".
        </p>
      </div>

      <div className={styles.actions}>
        <button className={styles.primaryBtn} onClick={onClose}>
          I'll think about it
        </button>
        <button className={styles.secondaryBtn} onClick={() => openUrl(REPO_URL)}>
          Open GitHub repo page
        </button>
      </div>
    </Modal>
  );
}

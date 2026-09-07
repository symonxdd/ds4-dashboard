import { useState } from "react";
import { Pencil } from "lucide-react";
import styles from "./ControllerName.module.css";

const MAX_LENGTH = 24;

// The controller's name, shown under the gauge with one controller connected
// and inside each card with several. Clicking it renames the controller.
export default function ControllerName({ label, onRename }) {
  const [draft, setDraft] = useState(null);

  const startEditing = (event) => {
    // Inside a card the surrounding element selects on click, so renaming must
    // not also change the selection.
    event.stopPropagation();
    setDraft(label);
  };

  const commit = () => {
    if (draft !== null && draft.trim() !== label) {
      onRename(draft);
    }
    setDraft(null);
  };

  const handleKeyDown = (event) => {
    event.stopPropagation();

    if (event.key === "Enter") {
      commit();
    } else if (event.key === "Escape") {
      setDraft(null);
    }
  };

  if (draft !== null) {
    return (
      <input
        className={`${styles.name} ${styles.input}`}
        value={draft}
        autoFocus
        maxLength={MAX_LENGTH}
        aria-label="Controller name"
        onChange={(event) => setDraft(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        onBlur={commit}
      />
    );
  }

  return (
    <button
      className={styles.name}
      onClick={startEditing}
      data-tooltip="Click to rename"
    >
      {label}
      <Pencil size={12} className={styles.editIcon} />
    </button>
  );
}

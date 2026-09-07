import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./Collapsible.module.css";

// `maxHeight` caps the open state's height animation, so it needs to clear the
// tile's tallest content without being so generous that the transition drags.
export default function Collapsible({ title, maxHeight, children }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`${styles.container} ${isExpanded ? styles.expanded : ""}`}>
      <button
        className={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className={styles.title}>{title}</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <div
        className={styles.contentWrapper}
        style={{ "--content-max-height": `${maxHeight}px` }}
      >
        <div className={styles.innerContent}>{children}</div>
      </div>
    </div>
  );
}

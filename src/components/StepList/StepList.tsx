import { useEffect, useRef } from "react";
import styles from "./StepList.module.css";

type Step = {
  id: string;
  track: string;
  name: string;
};

type StepListProps = {
  steps: Step[];
  currentId: string;
  passedIds: string[];
  onSelect: (id: string) => void;
};

export function StepList({ steps, currentId, passedIds, onSelect }: StepListProps) {
  const currentRef = useRef<HTMLButtonElement>(null);
  const passed = new Set(passedIds);
  const progress = new Map<string, { done: number; total: number }>();

  for (const step of steps) {
    const entry = progress.get(step.track) ?? { done: 0, total: 0 };
    entry.total += 1;
    if (passed.has(step.id)) entry.done += 1;
    progress.set(step.track, entry);
  }

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "nearest" });
  }, [currentId]);

  let track = "";
  let number = 0;

  return (
    <nav className={styles.rail} aria-label="题目顺序">
      <ol className={styles.list}>
        {steps.map((step) => {
          const showTrack = step.track !== track;
          if (showTrack) number = 0;
          number += 1;
          track = step.track;
          const current = step.id === currentId;
          const done = passed.has(step.id);
          const entry = progress.get(step.track);
          return (
            <li key={step.id}>
              {showTrack ? (
                <p className={styles.track}>
                  {step.track}
                  <span className={entry && entry.done > 0 ? styles.done : styles.total}>
                    {entry ? `${entry.done}/${entry.total}` : ""}
                  </span>
                </p>
              ) : null}
              <button
                ref={current ? currentRef : undefined}
                type="button"
                className={current ? styles.current : done ? styles.passed : styles.step}
                aria-current={current ? "step" : undefined}
                onClick={() => onSelect(step.id)}
              >
                <span className={done ? styles.mark : styles.markEmpty}>{done ? "✓" : ""}</span>
                <span className={styles.num}>{String(number).padStart(2, "0")}</span>
                <span>{step.name}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
